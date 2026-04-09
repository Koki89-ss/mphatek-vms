import React from "react";
import QRCode from "react-qr-code";
 
function QRPage() {
  return (
<div style={{ textAlign: "center", marginTop: "100px" }}>
<h2>Scan to Register Visitor</h2>
 
      <QRCode
        value = "http://192.168.1.142:3000/visitor-registration"
        size={200}
      />
 
      <p>Scan this QR to open visitor form</p>
</div>
  );
}
 
export default QRPage;