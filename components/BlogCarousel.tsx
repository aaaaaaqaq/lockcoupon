'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { IconNewspaper } from '@/components/icons';
import type { PostLight } from '@/lib/supabase';

const AUTOPLAY_MS = 3000;
const CLONES = 3; // max cards visible at once (desktop)

function PostCard({ post }: { post: PostLight }) {
  return (
    <article className="h-full">
      <Link href={`/blog/${post.slug}`} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group block h-full">
        {post.cover_image ? (
          <div className="h-[180px] overflow-hidden">
            <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : (
          <div className="h-[180px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <IconNewspaper size={40} className="text-primary/40" />
          </div>
        )}
        <div className="p-4">
          <div className="text-[12px] text-muted mb-2">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>
          <h3 className="text-text-main text-[16px] font-bold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted text-[13px] leading-relaxed line-clamp-2">{post.excerpt}</p>
          )}
          <span className="inline-block mt-3 text-primary text-[13px] font-semibold">Lire la suite →</span>
        </div>
      </Link>
    </article>
  );
}

export default function BlogCarousel({ posts }: { posts: PostLight[] }) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const count = posts.length;
  // Clone first cards at the end for a seamless infinite loop
  const slides = count > CLONES ? [...posts, ...posts.slice(0, CLONES)] : posts;

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i + 1);
  }, []);

  // Autoplay
  useEffect(() => {
    if (count <= CLONES) return;
    const id = setInterval(() => {
      if (pausedRef.current || reducedMotionRef.current || document.hidden) return;
      next();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, next]);

  // Seamless loop: after sliding onto the cloned cards, snap back to 0 without animation
  useEffect(() => {
    if (index < count) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      // re-enable animation on next frame
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, 620);
    return () => clearTimeout(t);
  }, [index, count]);

  if (count <= CLONES) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    );
  }

  const activeDot = index % count;

  return (
    <div
      className="relative"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 4000); }}
    >
      <div className="overflow-hidden -mx-2.5" role="region" aria-roledescription="carrousel" aria-label="Derniers articles du blog">
        <div
          ref={trackRef}
          className="flex [--slide-w:100%] md:[--slide-w:33.3333%]"
          style={{
            transform: `translateX(calc(-${index} * var(--slide-w)))`,
            transition: animate ? 'transform 600ms cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
          }}
        >
          {slides.map((post, i) => (
            <div
              key={`${post.id}-${i}`}
              className="w-full md:w-1/3 flex-shrink-0 px-2.5"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {posts.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Aller à l'article ${i + 1}`}
            onClick={() => { setAnimate(true); setIndex(i); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeDot ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
