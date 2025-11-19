import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AffectedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  verification_status: string;
  background_check_verified: boolean;
  verification_documents_uploaded_at: string | null;
  id_document_url: string | null;
  blue_card_document_url: string | null;
}

export default function AdminDocumentFix() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AffectedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AffectedUser | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAffectedUsers();
  }, []);

  const loadAffectedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pet_sitter')
        .eq('is_verified', true)
        .not('verification_documents_uploaded_at', 'is', null)
        .or('blue_card_document_url.is.null,id_document_url.is.null')
        .order('verification_documents_uploaded_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error Loading Users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDocumentsVerified = async (user: AffectedUser) => {
    setProcessing(true);
    try {
      // Update profile to mark both documents as verified
      const { error } = await supabase
        .from('profiles')
        .update({
          background_check_verified: true,
          id_document_url: 'MANUALLY_VERIFIED_BY_ADMIN',
          blue_card_document_url: 'MANUALLY_VERIFIED_BY_ADMIN',
          verification_documents_uploaded_at: user.verification_documents_uploaded_at || new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Documents Marked as Verified',
        description: `${user.first_name} ${user.last_name}'s documents are now marked as verified.`,
      });

      // Reload the list
      await loadAffectedUsers();
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkFix = async () => {
    setProcessing(true);
    try {
      const userIds = users.map(u => u.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          background_check_verified: true,
          id_document_url: 'MANUALLY_VERIFIED_BY_ADMIN',
          blue_card_document_url: 'MANUALLY_VERIFIED_BY_ADMIN',
        })
        .in('id', userIds);

      if (error) throw error;

      toast({
        title: 'Bulk Fix Complete',
        description: `Fixed document status for ${userIds.length} users.`,
      });

      // Reload the list
      await loadAffectedUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading affected users...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Document URL Fix Tool
          </CardTitle>
          <CardDescription>
            These verified sitters have uploaded documents but the URLs are missing from the database.
            This tool allows you to manually mark their documents as verified without requiring re-upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No affected users found!</p>
              <p className="text-sm">All verified sitters have proper document URLs.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {users.length} verified sitter{users.length !== 1 ? 's' : ''} with missing document URLs
                </p>
                <Button
                  onClick={handleBulkFix}
                  disabled={processing}
                  variant="default"
                >
                  {processing ? 'Processing...' : `Fix All ${users.length} Users`}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                              {user.verification_status}
                            </Badge>
                            {user.background_check_verified && (
                              <Badge variant="default" className="bg-yellow-500">
                                Police Vet ✓
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.verification_documents_uploaded_at
                            ? new Date(user.verification_documents_uploaded_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            disabled={processing}
                          >
                            Mark Verified
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Documents as Verified</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark both ID and Police Vet Check documents as "MANUALLY_VERIFIED_BY_ADMIN" for{' '}
              <strong>
                {selectedUser?.first_name} {selectedUser?.last_name}
              </strong>
              .
              <br /><br />
              This action confirms that you have manually reviewed and approved their documents,
              and they won't need to re-upload anything.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleMarkDocumentsVerified(selectedUser)}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Mark as Verified'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
