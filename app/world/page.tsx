export default function WorldPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>World Overview</h1>
      <p style={{ color: '#5a4f46', fontSize: '0.8rem', marginBottom: '2rem' }}>
        The history of what was lost — and what must be reclaimed.
      </p>
      <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#5a4f46' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌍</div>
        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d3228' }}>
          Lore coming soon
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
          The story of The Storm, the five Warlords, and the territories they carved from the ruins will be revealed here.
        </p>
      </div>
    </div>
  )
}
