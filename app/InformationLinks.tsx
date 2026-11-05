'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import InformationContent, { informationTitles, type InformationKind } from './InformationContent';
import './Information.css';

export default function InformationLinks() {
  const [active, setActive] = useState<InformationKind | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (!active || !dialog.current) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    element.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [active]);
  return <>
    <nav className="lm-info-links" aria-label="Kontakt und rechtliche Informationen">
      {(Object.keys(informationTitles) as InformationKind[]).map(kind => <a key={kind} href={'/' + kind} aria-haspopup="dialog" onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault(); trigger.current = event.currentTarget; setActive(kind);
      }}>{informationTitles[kind]}</a>)}
    </nav>
    {active && createPortal(<dialog ref={dialog} className="lm-info-dialog" aria-labelledby="lm-info-title" onCancel={() => setActive(null)} onClick={event => { if(event.target === event.currentTarget) { const box=event.currentTarget.getBoundingClientRect(); if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setActive(null); } }}>
      {active && <><header className="lm-info-header"><div><span>LANDHEIM AMMERSEE · JUGEND GRÜNDET</span><h1 id="lm-info-title">{informationTitles[active]}</h1></div><button type="button" autoFocus onClick={() => setActive(null)} aria-label="Informationsfenster schließen">×</button></header>
      <div className="lm-info-body"><InformationContent kind={active}/></div>
      <footer className="lm-info-actions"><a href={'/' + active}>Als eigene Seite öffnen ↗</a><button type="button" onClick={() => setActive(null)}>Schließen</button></footer></>}
    </dialog>, document.body)}
  </>;
}
