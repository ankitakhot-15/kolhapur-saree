import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  Twitter,
  Mail,
  Link2,
  Download,
  X
} from 'lucide-react';
import type { SareeProduct } from '../types/index.ts';
import { formatPriceINR } from '../utils/formatters.ts';
import { storeService } from '../services/storeService.ts';

/* -------------------------------------------------------------------------- */
/* What gets shared                                                           */
/* -------------------------------------------------------------------------- */

export interface ShareContent {
  title: string;
  /** Full message: name, fabric, colour, price, link and shop contact */
  text: string;
  /** Link to the saree */
  url: string;
  /** Photo to attach (a Cloudinary URL works best) */
  imageUrl?: string;
}

type Variant = SareeProduct['variants'][number];

/**
 * Builds the message for a saree.
 * Pass the selected colour as `variant` so its price and photo are used.
 */
export function buildSareeShare(
  product: Partial<SareeProduct>,
  variant?: Variant,
  opts: { url?: string; imageUrl?: string } = {}
): ShareContent {
  const v = variant ?? product.variants?.[0];
  const hasWindow = typeof window !== 'undefined';
  const origin = hasWindow ? window.location.origin : '';

  const url =
    opts.url ??
    (product.id
      ? `${origin}/?saree=${encodeURIComponent(product.id)}`
      : hasWindow
        ? window.location.href
        : '');

  const imageUrl =
    opts.imageUrl ?? (v?.images || []).filter(Boolean)[0] ?? product.primaryImage ?? undefined;

  const name = product.name || 'Kolhapuri saree';
  const lines: string[] = [`✨ ${name}`];

  if (product.fabric) lines.push(`Fabric: ${product.fabric}`);
  if (product.occasion) lines.push(`Occasion: ${product.occasion}`);
  if (v?.colorName) lines.push(`Colour: ${v.colorName}`);

  if (v?.sellingPricePaise) {
    let price = `Price: ${formatPriceINR(v.sellingPricePaise)}`;
    if (v.originalPricePaise > v.sellingPricePaise) {
      const off = Math.round((1 - v.sellingPricePaise / v.originalPricePaise) * 100);
      price += ` (was ${formatPriceINR(v.originalPricePaise)}, ${off}% off)`;
    }
    lines.push(price);
  }

  if (product.description) {
    const d = product.description.trim();
    lines.push('', d.length > 140 ? d.slice(0, 137).trimEnd() + '...' : d);
  }

  if (url) lines.push('', `View this saree: ${url}`);

  let phone = '';
  try {
    phone = storeService.getSettings().businessPhone || '';
  } catch {
    phone = '';
  }
  lines.push('', `Kolhapuri Fashion Saree${phone ? ` · Call or WhatsApp ${phone}` : ''}`);

  return { title: name, text: lines.join('\n'), url, imageUrl };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// A JPG at a sensible size works in every app (WebP/AVIF often does not).
function shareImageUrl(url: string): string {
  const marker = '/image/upload/';
  return url.includes(marker) ? url.replace(marker, `${marker}f_jpg,q_auto,w_1200,c_limit/`) : url;
}

async function fetchImageFile(url: string, title: string): Promise<File | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const base = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'saree';
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch {
    return null;
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const enc = encodeURIComponent;

/* -------------------------------------------------------------------------- */
/* UI                                                                         */
/* -------------------------------------------------------------------------- */

interface TileProps {
  label: string;
  color: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const ShareTile: React.FC<TileProps> = ({ label, color, children, href, onClick }) => {
  const circle = (
    <span
      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
      style={{ background: color }}
    >
      {children}
    </span>
  );
  const cls = 'flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#292522] hover:opacity-80';

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
      {circle}
      {label}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {circle}
      {label}
    </button>
  );
};

interface ShareSareeButtonProps {
  content: ShareContent;
  /** Replaces the default round white icon style */
  className?: string;
}

export const ShareSareeButton: React.FC<ShareSareeButtonProps> = ({ content, className }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [prep, setPrep] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [note, setNote] = useState('');

  const shareImg = useMemo(
    () => (content.imageUrl ? shareImageUrl(content.imageUrl) : ''),
    [content.imageUrl]
  );

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Download the photo as soon as the menu opens, so the share call itself can
  // run instantly (phones only allow sharing right after a tap).
  useEffect(() => {
    if (!open) return;
    setNote('');
    if (!shareImg) {
      setFile(null);
      setPrep('failed');
      return;
    }
    let cancelled = false;
    setPrep('loading');
    setFile(null);
    fetchImageFile(shareImg, content.title).then((f) => {
      if (cancelled) return;
      setFile(f);
      setPrep(f ? 'ready' : 'failed');
    });
    return () => {
      cancelled = true;
    };
  }, [open, shareImg, content.title]);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const messageWithPhoto = shareImg ? `${content.text}\nPhoto: ${shareImg}` : content.text;

  const nativeShare = async () => {
    try {
      const data: ShareData = { title: content.title, text: content.text };
      if (file && navigator.canShare?.({ files: [file] })) data.files = [file];
      await navigator.share(data);
      setOpen(false);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        setNote('This device blocked sharing. Please use one of the options below.');
      }
    }
  };

  const savePhoto = async (): Promise<boolean> => {
    const f = file ?? (shareImg ? await fetchImageFile(shareImg, content.title) : null);
    if (!f) {
      if (shareImg) window.open(shareImg, '_blank', 'noopener');
      return false;
    }
    const href = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = href;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    return true;
  };

  const copyDetails = async () => {
    const ok = await copyText(content.text);
    setNote(ok ? 'Details copied. Paste them anywhere.' : 'Could not copy. Please select the text manually.');
  };

  // Instagram has no web link for sharing, so: copy the caption, save the
  // photo, then the owner creates the post or story in the Instagram app.
  const shareToInstagram = async () => {
    const copied = await copyText(content.text);
    const saved = await savePhoto();
    setNote(
      copied && saved
        ? 'Caption copied and photo saved. Open Instagram, create a post or story, add the photo and paste the caption.'
        : copied
          ? 'Caption copied. Save the photo with the "Save photo" button, then post it in Instagram.'
          : 'Open Instagram and post the photo. Use "Copy details" for the caption.'
    );
  };

  const trigger =
    className ??
    'w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#292522]';

  return (
    <>
      <button
        type="button"
        className={trigger}
        aria-label="Share this saree"
        title="Share"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Share this saree"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-[#292522]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif font-bold text-base">Share this saree</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="p-1 text-[#766B61] hover:text-[#292522]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview of what will be sent */}
              <div className="flex gap-3 p-3 rounded-lg bg-[#FAF7F0] border border-[#E6E0D8]">
                {shareImg && (
                  <img
                    src={shareImg}
                    alt=""
                    className="w-16 h-20 rounded object-cover shrink-0 bg-white"
                  />
                )}
                <p className="text-xs text-[#766B61] whitespace-pre-line line-clamp-6">
                  {content.text.split('\n\nView this saree')[0]}
                </p>
              </div>

              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  disabled={prep === 'loading'}
                  className="w-full py-2.5 rounded-lg bg-[#641D32] hover:bg-[#4A1223] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {prep === 'loading'
                    ? 'Preparing photo…'
                    : file
                      ? 'Share photo + details (WhatsApp, Instagram, more)'
                      : 'Share details (WhatsApp, Instagram, more)'}
                </button>
              )}

              <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                <ShareTile
                  label="WhatsApp"
                  color="#25D366"
                  href={`https://wa.me/?text=${enc(messageWithPhoto)}`}
                >
                  <MessageCircle className="w-5 h-5" />
                </ShareTile>

                <ShareTile label="Instagram" color="#C13584" onClick={shareToInstagram}>
                  <Instagram className="w-5 h-5" />
                </ShareTile>

                <ShareTile
                  label="Facebook"
                  color="#1877F2"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${enc(content.url)}&quote=${enc(content.title)}`}
                >
                  <Facebook className="w-5 h-5" />
                </ShareTile>

                <ShareTile
                  label="Telegram"
                  color="#229ED9"
                  href={`https://t.me/share/url?url=${enc(content.url)}&text=${enc(content.text)}`}
                >
                  <Send className="w-5 h-5" />
                </ShareTile>

                <ShareTile
                  label="X"
                  color="#111111"
                  href={`https://twitter.com/intent/tweet?text=${enc(content.title)}&url=${enc(content.url)}`}
                >
                  <Twitter className="w-5 h-5" />
                </ShareTile>

                {shareImg && (
                  <ShareTile
                    label="Pinterest"
                    color="#E60023"
                    href={`https://pinterest.com/pin/create/button/?url=${enc(content.url)}&media=${enc(shareImg)}&description=${enc(content.title)}`}
                  >
                    P
                  </ShareTile>
                )}

                <ShareTile
                  label="Email"
                  color="#766B61"
                  href={`mailto:?subject=${enc(content.title)}&body=${enc(messageWithPhoto)}`}
                >
                  <Mail className="w-5 h-5" />
                </ShareTile>

                <ShareTile label="Copy details" color="#641D32" onClick={copyDetails}>
                  <Link2 className="w-5 h-5" />
                </ShareTile>

                {shareImg && (
                  <ShareTile
                    label="Save photo"
                    color="#292522"
                    onClick={async () => {
                      const ok = await savePhoto();
                      setNote(ok ? 'Photo saved to your device.' : 'Opened the photo in a new tab.');
                    }}
                  >
                    <Download className="w-5 h-5" />
                  </ShareTile>
                )}
              </div>

              {note && (
                <p className="text-xs text-[#641D32] bg-[#FAF7F0] border border-[#E6E0D8] rounded p-2.5" aria-live="polite">
                  {note}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ShareSareeButton;