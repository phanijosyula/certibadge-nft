'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function IssuerDashboard() {
  const [form, setForm] = useState({
    recipient: '',
    courseId: '',
    issuedBy: '',
    issuedDate: '',
    metadataURI: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const [log, setLog] = useState<any[]>([]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const resolveENS = async () => {
    if (!form.recipient.endsWith('.eth')) return;
    const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
    const address = await provider.resolveName(form.recipient);
    if (!address) return alert('ENS name not found');
    setForm((f) => ({ ...f, recipient: address }));
    setStatus(`Resolved ENS to ${address}`);
  };

  const uploadToIPFS = async () => {
    if (!imageFile) return alert('Upload an image');
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
    const formData = new FormData();
    formData.append('file', imageFile);
    const imgRes = await axios.post('https://api.web3.storage/upload', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const imgURI = `ipfs://${imgRes.data.cid}/${imageFile.name}`;

    const metadata = {
      name: form.courseId,
      description: `Issued by ${form.issuedBy}`,
      image: imgURI,
      attributes: [
        { trait_type: 'Course', value: form.courseId },
        { trait_type: 'Issuer', value: form.issuedBy },
        { trait_type: 'Date', value: form.issuedDate }
      ]
    };

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metaForm = new FormData();
    metaForm.append('file', blob, 'metadata.json');
    const metaRes = await axios.post('https://api.web3.storage/upload', metaForm, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metaURI = `ipfs://${metaRes.data.cid}/metadata.json`;
    setForm((f) => ({ ...f, metadataURI: metaURI }));
    setStatus('✅ Metadata uploaded');
  };

  const handleIssue = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      ['function issueBadge(address,string,string,string,string) external'],
      signer
    );

    const tx = await contract.issueBadge(
      form.recipient,
      form.courseId,
      form.issuedBy,
      form.issuedDate,
      form.metadataURI
    );

    setLog((prev) => [
      ...prev,
      {
        recipient: form.recipient,
        courseId: form.courseId,
        issuedBy: form.issuedBy,
        issuedDate: form.issuedDate,
        metadataURI: form.metadataURI,
        txHash: tx.hash
      }
    ]);

    await tx.wait();
    setStatus('✅ Badge issued!');
  };

  const downloadCSV = () => {
    const header = 'Recipient,Course,Issuer,Date,MetadataURI,TxHash\n';
    const rows = log
      .map((entry) =>
        [entry.recipient, entry.courseId, entry.issuedBy, entry.issuedDate, entry.metadataURI, entry.txHash].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    saveAs(blob, 'issued_badges_log.csv');
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">CertiBadge Issuer Dashboard</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Input name="recipient" placeholder="Recipient Wallet or ENS" onChange={handleChange} />
          <Button variant="secondary" onClick={resolveENS}>Resolve ENS</Button>
          <Input name="courseId" placeholder="Course ID" onChange={handleChange} />
          <Input name="issuedBy" placeholder="Issuer Name" onChange={handleChange} />
          <Input name="issuedDate" placeholder="YYYY-MM-DD" onChange={handleChange} />
          <Input type="file" onChange={handleImageUpload} />
          {preview && <img src={preview} alt="Badge Preview" className="rounded w-32" />}
          <Button onClick={uploadToIPFS}>Upload Metadata to IPFS</Button>
          <Input name="metadataURI" placeholder="IPFS Metadata URI" value={form.metadataURI} onChange={handleChange} />
          <Button onClick={handleIssue}>Issue Badge</Button>
          <Button variant="outline" onClick={downloadCSV}>Download CSV Log</Button>
          {status && <p className="text-muted-foreground text-sm">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
