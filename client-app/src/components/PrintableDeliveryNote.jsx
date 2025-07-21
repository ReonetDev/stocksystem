import React from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import reologo from '../assets/reologo.gif'; // Import the logo image

const PrintableDeliveryNote = React.forwardRef(({ deliveryNote }, ref) => {
    if (!deliveryNote) {
        return null;
    }

    return (
        <div ref={ref} style={{ padding: '20mm', fontSize: '12pt', lineHeight: '1.5' }}>
            <style type="text/css" media="print">
                {`
                @page {
                    size: A4;
                    margin: 20mm;
                }
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .print-header img {
                    width: 128px;
                    height: auto;
                }
                .print-header h2 {
                    margin: 0;
                    font-size: 24pt;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .info-col {
                    flex: 1;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                `}
            </style>
            <div className="print-header">
                <h2>Delivery Note: {deliveryNote.delNoteNumber}</h2>
                <img src={reologo} alt="Reonet Logo" />
            </div>

            <div className="info-row">
                <div className="info-col">
                    <strong>Date:</strong> {new Date(deliveryNote.dateTime).toLocaleString()}
                </div>
                <div className="info-col">
                    <strong>Destination:</strong> {deliveryNote.destination}
                </div>
            </div>
            <div className="info-row">
                <div className="info-col">
                    <strong>Comments:</strong> {deliveryNote.comments}
                </div>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Serial Number</th>
                        <th>Description</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {deliveryNote.items.$values.map(item => (
                        <tr key={item.serialStock.id}>
                            <td>{item.serialStock.serialNumber}</td>
                            <td>{item.serialStock.description}</td>
                            <td>{item.serialStock.make}</td>
                            <td>{item.serialStock.model}</td>
                            <td>{item.serialStock.size}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
});

export default PrintableDeliveryNote;
