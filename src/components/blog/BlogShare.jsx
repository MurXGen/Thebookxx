"use client";

import { useState } from "react";
import { Share2, Twitter, Facebook, Link2, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// Share / follow row (like a news article) to help posts spread. Uses the
// native share sheet on mobile plus explicit WhatsApp / X / Facebook / copy.
export default function BlogShare({ title, slug }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.thebookx.in/blogs/${slug}`;
  const text = `${title} — TheBookX`;

  const native = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (_) {}
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (_) {}
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="blog-share">
      <button type="button" className="blog-share-label" onClick={native}>
        <Share2 size={15} /> Share
      </button>
      <div className="blog-share-btns">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn wa"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp size={16} />
        </a>
        <a
          href={tw}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn tw"
          aria-label="Share on X"
        >
          <Twitter size={15} />
        </a>
        <a
          href={fb}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn fb"
          aria-label="Share on Facebook"
        >
          <Facebook size={15} />
        </a>
        <button
          type="button"
          className="blog-share-btn copy"
          onClick={copy}
          aria-label="Copy link"
        >
          {copied ? <Check size={15} /> : <Link2 size={15} />}
        </button>
      </div>
    </div>
  );
}
