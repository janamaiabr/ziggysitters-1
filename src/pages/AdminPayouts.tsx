import PayoutsTab from '@/components/admin/PayoutsTab';

export default function AdminPayouts() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Monitor and process sitter payouts</p>
      </div>
      <PayoutsTab />
    </div>
  );
}
