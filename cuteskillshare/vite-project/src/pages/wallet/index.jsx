import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const transactions = [
  { id: 1, type: 'earned', label: 'Completed exchange with Sarah Chen', amount: 50, date: 'Feb 12, 2026', icon: 'ArrowDownLeft' },
  { id: 2, type: 'spent', label: 'Enrolled in Advanced React Patterns', amount: 450, date: 'Feb 10, 2026', icon: 'ArrowUpRight' },
  { id: 3, type: 'earned', label: 'Session with Michael Torres', amount: 50, date: 'Feb 9, 2026', icon: 'ArrowDownLeft' },
  { id: 4, type: 'earned', label: 'Referral bonus — Emma Wilson', amount: 100, date: 'Feb 8, 2026', icon: 'Gift' },
  { id: 5, type: 'spent', label: 'Enrolled in UI/UX Design Fundamentals', amount: 350, date: 'Feb 6, 2026', icon: 'ArrowUpRight' },
  { id: 6, type: 'earned', label: 'Completed exchange with David Kim', amount: 50, date: 'Feb 5, 2026', icon: 'ArrowDownLeft' },
  { id: 7, type: 'earned', label: '5-day streak bonus', amount: 25, date: 'Feb 4, 2026', icon: 'Flame' },
  { id: 8, type: 'earned', label: 'Completed exchange with Lisa Anderson', amount: 50, date: 'Feb 3, 2026', icon: 'ArrowDownLeft' },
];

const WalletPage = () => {
  const [tab, setTab] = useState('all');

  const totalEarned = transactions.filter((t) => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0);
  const balance = 1250;

  const filtered = transactions.filter((t) => {
    if (tab === 'all') return true;
    return t.type === tab;
  });

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Wallet
        </h1>
        <p className="text-muted-foreground">Manage your SkillCoins and transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/30 flex items-center justify-center mx-auto mb-3">
            <Icon name="Wallet" size={24} color="var(--color-primary-foreground)" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Current Balance</p>
        </div>
        <div className="bg-success/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-success/30 flex items-center justify-center mx-auto mb-3">
            <Icon name="TrendingUp" size={24} color="var(--color-success-foreground)" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">+{totalEarned}</p>
          <p className="text-sm text-muted-foreground">Total Earned</p>
        </div>
        <div className="bg-accent/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center mx-auto mb-3">
            <Icon name="TrendingDown" size={24} color="var(--color-accent-foreground)" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">-{totalSpent}</p>
          <p className="text-sm text-muted-foreground">Total Spent</p>
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-8">
        <h2 className="font-heading font-semibold text-foreground mb-3">Ways to Earn SkillCoins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: 'ArrowLeftRight', label: 'Complete an exchange', coins: '+50' },
            { icon: 'Flame', label: 'Daily streak bonus', coins: '+5–25' },
            { icon: 'UserPlus', label: 'Refer a friend', coins: '+100' },
            { icon: 'Star', label: 'Get a 5-star review', coins: '+20' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-muted rounded-xl p-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/40 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={18} color="var(--color-foreground)" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs font-bold text-success-foreground">{item.coins} coins</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-heading font-semibold text-foreground">Transaction History</h2>
          <div className="flex gap-2">
            {['all', 'earned', 'spent'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  tab === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((tx) => (
            <div key={tx.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'earned' ? 'bg-success/20' : 'bg-accent/20'
                }`}
              >
                <Icon
                  name={tx.icon}
                  size={18}
                  color={
                    tx.type === 'earned'
                      ? 'var(--color-success-foreground)'
                      : 'var(--color-accent-foreground)'
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <span
                className={`text-sm font-bold ${
                  tx.type === 'earned' ? 'text-success-foreground' : 'text-accent-foreground'
                }`}
              >
                {tx.type === 'earned' ? '+' : '-'}{tx.amount}
              </span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
