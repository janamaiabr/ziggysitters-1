import CreateAdminUser from '@/components/CreateAdminUser';

export default function CreateAdmin() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin User Management</h1>
          <p className="text-muted-foreground">Create a new administrator account</p>
        </div>
        
        <CreateAdminUser />
      </div>
    </div>
  );
}