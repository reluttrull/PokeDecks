import React from 'react';
import QRCode from "react-qr-code";
import './App.css';

const QRWrapper = ({url}) => {

  return (
    <div style={{ background: 'white', padding: '16px' }}>
        <QRCode style={{ height: '100%', width: '100%'}} value={url} />
    </div>
  );
};

export default QRWrapper;
