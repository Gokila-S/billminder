import { useEffect, useRef } from 'react';
import { IndianRupee } from './Icons';

export default function SpendingChart({ bills }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Group by category
    const data = {};
    bills.forEach(bill => {
      data[bill.category] = (data[bill.category] || 0) + parseFloat(bill.amount);
    });

    const categories = Object.keys(data);
    const amounts = Object.values(data);
    const maxAmount = Math.max(...amounts, 1);

    const barHeight = 36;
    const gap = 16;
    const totalHeight = Math.max(200, categories.length * (barHeight + gap) + 40);
    canvas.height = totalHeight;

    const width = canvas.width;
    const startX = 120;
    const availWidth = width - startX - 80;

    // Background
    ctx.fillStyle = '#fef9c3'; // yellow-100
    ctx.fillRect(0, 0, width, totalHeight);

    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textBaseline = 'middle';

    const colors = ['#ff6f91', '#f9d56e', '#845ec2', '#00c9a7', '#ff9671', '#ffc75f', '#4b5563'];

    categories.forEach((cat, i) => {
      const y = 20 + (barHeight + gap) * i;
      const amount = data[cat];
      const barWidth = Math.max((amount / maxAmount) * availWidth, 8);

      // Label
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText(cat, startX - 10, y + barHeight / 2);

      // Bar shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(startX + 3, y + 3, barWidth, barHeight);

      // Bar
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(startX, y, barWidth, barHeight);

      // Bar border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, y, barWidth, barHeight);

      // Value
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(`₹${amount.toFixed(0)}`, startX + barWidth + 10, y + barHeight / 2);
    });

    if (categories.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillText('No spending data yet', width / 2, totalHeight / 2);
    }
  }, [bills]);

  return (
    <div className="p-4 bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg">
      <h3 className="font-bold text-xl mb-4 font-mono uppercase tracking-tighter flex items-center gap-2">
        <IndianRupee size={18} /> Spending by Category
      </h3>
      <canvas ref={canvasRef} width={600} height={200} className="w-full" />
    </div>
  );
}
