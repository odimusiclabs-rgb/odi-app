import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { defaultSiteContent, type SiteContent } from '@/data/siteContent';

export default function Hero() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('site_content')
      .select('id, hero_title, hero_subtitle, hero_image_url, jet_image_url, updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setContent(data as SiteContent);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center px-6 sm:px-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={content.hero_image_url}
          alt="Featured artist"
          className="h-[78%] w-auto max-w-[88vw] rounded-[32px] object-cover opacity-90 sm:h-[82%]"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 55%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 55%, transparent 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_85%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-[#222222] bg-black/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#888888] backdrop-blur-sm animate-fade-up">
          Featured
        </span>
        <h1
          className="font-anton text-5xl uppercase leading-[0.95] text-white animate-fade-up sm:text-7xl md:text-8xl"
          style={{ animationDelay: '0.1s', textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
        >
          {content.hero_title.split(/\s+/).map((word, index) => (
            <span key={`${word}-${index}`}>
              {index > 0 && <br />}
              {word}
            </span>
          ))}
        </h1>
        <p
          className="mt-5 text-base font-light text-[#888888] animate-fade-up sm:text-lg"
          style={{ animationDelay: '0.25s' }}
        >
          {content.hero_subtitle}
        </p>
      </div>
    </section>
  );
}
