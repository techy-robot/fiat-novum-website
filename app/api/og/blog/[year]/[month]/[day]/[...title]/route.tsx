import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const day = searchParams.get('day');
  const slug = searchParams.get('slug');

  const targetDate = `${year}-${month}-${day}`;

  const reader = createReader(process.cwd(), keystaticConfig);
  const allPosts = await reader.collections.posts.all();
  const post = allPosts.find((p) => p.entry.publishDate === targetDate && p.slug === slug);

  const displayTitle = post ? post.entry.title : 'FIAT NOVUM';
  const displaySummary = post ? post.entry.summary : 'Engineering & Design Portfolio';

  // Load both font buffers from public folder
  let tarsBuffer;
  let nunitoBuffer;
  try {
    tarsBuffer = fs.readFileSync(path.join(process.cwd(), 'public/fonts/TarsMonoSmooth.ttf'));
    nunitoBuffer = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Nunito-Regular.ttf'));
  } catch (error) {
    console.warn('Could not load custom fonts, falling back to system defaults:', error);
  }

  const MINT_GREEN = '#00f59b';
  const DEEP_BLACK = '#000000';

  // Construct the fonts array for Satori based on what successfully loaded
  const fontOptions = [];
  if (tarsBuffer) {
    fontOptions.push({ name: 'TarsMono', data: tarsBuffer, style: 'normal' as const });
  }
  if (nunitoBuffer) {
    fontOptions.push({ name: 'Nunito', data: nunitoBuffer, style: 'normal' as const });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: DEEP_BLACK,
          color: '#ffffff',
        }}
      >
        {/* Top Navbar Simulation Block */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '40px 60px',
            backgroundColor: DEEP_BLACK,
          }}
        >
          {/* Mint Logo Box using TarsMono */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: `3px solid ${MINT_GREEN}`,
              padding: '6px 16px',
              borderRadius: '6px',
              fontFamily: tarsBuffer ? 'TarsMono' : 'monospace',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: MINT_GREEN, letterSpacing: '0.05em', lineHeight: 1.1 }}>
              FIAT NOVUM
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: MINT_GREEN, letterSpacing: '0.05em', lineHeight: 1.1 }}>
              ENGINEERING
            </span>
          </div>
          
          <span style={{ fontSize: 20, color: MINT_GREEN, opacity: 0.8, fontFamily: tarsBuffer ? 'TarsMono' : 'monospace' }}>
            /blog
          </span>
        </div>

        {/* Dynamic Big Post Title */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: DEEP_BLACK,
            paddingBottom: '30px',
            paddingLeft: '60px',
            paddingRight: '60px',
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: MINT_GREEN,
              margin: 0,
              textAlign: 'center',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              fontFamily: tarsBuffer ? 'TarsMono' : 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {displayTitle}
          </h1>
        </div>

        {/* Bottom Horizon: Gradient & Nunito Paragraph Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(to bottom, ${DEEP_BLACK} 0%, ${MINT_GREEN} 65%, #00b370 100%)`,
            padding: '0 80px',
          }}
        >
          <p
            style={{
              fontSize: 32,
              color: DEEP_BLACK,
              textAlign: 'center',
              lineHeight: 1.4,
              margin: 0,
              fontWeight: '500',
              fontFamily: nunitoBuffer ? 'Nunito' : 'sans-serif',
              width: '1000px',
            }}
          >
            {displaySummary}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontOptions,
    }
  );
}