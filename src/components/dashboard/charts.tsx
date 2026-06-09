'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function IncomeExpenseChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#f1f5f9',
            fontFamily: 'Cairo',
            direction: 'rtl',
          }}
        />
        <Bar dataKey="income" name="الدخل" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ data }: { data: { name: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="amount"
          nameKey="name"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#f1f5f9',
            fontFamily: 'Cairo',
            direction: 'rtl',
          }}
          formatter={(value) => `${Number(value).toLocaleString('en-US')} EGP`}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12, direction: 'rtl' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CashflowLine({ data }: { data: { date: string; income: number; expenses: number; net: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#f1f5f9',
            fontFamily: 'Cairo',
            direction: 'rtl',
          }}
          formatter={(value) => `${Number(value).toLocaleString('en-US')} EGP`}
        />
        <Line type="monotone" dataKey="income" name="الدخل" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="expenses" name="المصروفات" stroke="#ef4444" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="net" name="الصافي" stroke="#06b6d4" strokeWidth={2} dot={false} />
        <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BucketCompare({ data }: { data: { name: string; personal: number; digi_whale: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#f1f5f9',
            fontFamily: 'Cairo',
            direction: 'rtl',
          }}
        />
        <Bar dataKey="personal" name="شخصي" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        <Bar dataKey="digi_whale" name="Digi Whale" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
