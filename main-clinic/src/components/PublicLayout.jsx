import { useEffect, useState } from "react";

import LoginModal from "legacy-src/pages/public/clinic-join/modal/login";
import { headerMenus } from "legacy-src/pages/public/clinic-join/constant";
import Header from "legacy-src/pages/public/clinic-join/component/header";

function PublicLayoutInner({children, mode}) {
 const [modalOpen, setModalOpen] = useState(mode=="login"); // mode = login, scrolling
  return (
    <div className="min-h-screen bg-[#f8fafd]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Header headerMenus={headerMenus} setModalOpen={setModalOpen} /> 
      {children}
    </div>
  );
}

export default function PublicLayout({ children ,mode }) {
  return (
    <PublicLayoutInner mode={mode}>
      {children}
    </PublicLayoutInner>
  );
}