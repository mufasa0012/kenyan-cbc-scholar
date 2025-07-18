import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select(`
          *,
          students (
            student_number,
            profiles:profile_id (full_name)
          ),
          profiles:created_by (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch financial transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFinancialStats = () => {
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const paidAmount = transactions
      .filter(t => t.payment_status === 'paid')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const pendingAmount = transactions
      .filter(t => t.payment_status === 'pending')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const overdueAmount = transactions
      .filter(t => t.payment_status === 'overdue')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
  };

  const stats = getFinancialStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Finance Management</h1>
            <p className="text-muted-foreground">Track school fees, payments, and financial records</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Transactions</CardTitle>
            <CardDescription>
              Recent payment records and financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading transactions...</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-medium">{transaction.description}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {transaction.students && (
                              <p>
                                Student: {transaction.students.profiles?.full_name} 
                                ({transaction.students.student_number})
                              </p>
                            )}
                            <p>Type: {transaction.transaction_type}</p>
                            <p>Created: {formatDate(transaction.created_at)}</p>
                            {transaction.due_date && (
                              <p>Due: {formatDate(transaction.due_date)}</p>
                            )}
                            {transaction.payment_date && (
                              <p>Paid: {formatDate(transaction.payment_date)}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold">
                            {formatCurrency(transaction.amount)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(transaction.payment_status)}`}>
                            {transaction.payment_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {transaction.payment_status !== 'paid' && (
                          <Button variant="outline" size="sm">
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No financial transactions found
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Finance;