import { ImageResponse } from "next/og";

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Chess Affiliate';
  const subtitle = searchParams.get('subtitle') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            background: 'linear-gradient(135deg,#0f766e,#042f2e)',
            color: 'white',
            fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ marginTop: 24, fontSize: 32, opacity: 0.9 }}>{subtitle}</div>}
        <div style={{ position: 'absolute', bottom: 32, right: 48, fontSize: 24, opacity: 0.6 }}>chessaf</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
