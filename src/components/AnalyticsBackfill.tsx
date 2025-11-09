import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AnalyticsBackfill = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState<{ processed_records: number; created_analytics_records: number } | null>(null);
  const { toast } = useToast();

  const runBackfill = async () => {
    try {
      setLoading(true);
      setCompleted(false);
      setStats(null);

      const { data, error } = await supabase
        .rpc('backfill_sales_analytics' as any);

      if (error) {
        console.error('Error running backfill:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setStats(data[0]);
        setCompleted(true);
        toast({
          title: "Backfill Completed",
          description: `Processed ${data[0].processed_records} records and created ${data[0].created_analytics_records} analytics entries`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to run analytics backfill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Analytics Data Backfill
        </CardTitle>
        <CardDescription>
          Populate sales analytics data from existing subscriptions and refunds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will clear existing analytics data and rebuild it from all subscription and refund records. 
            This operation may take a few moments depending on the amount of data.
          </AlertDescription>
        </Alert>

        {stats && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Backfill completed successfully!</strong><br />
              Processed {stats.processed_records} subscription records<br />
              Created {stats.created_analytics_records} analytics entries
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={runBackfill} 
          disabled={loading || completed}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Backfill...
            </>
          ) : completed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Backfill Completed
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Run Analytics Backfill
            </>
          )}
        </Button>

        {completed && (
          <p className="text-sm text-muted-foreground text-center">
            Analytics data has been successfully populated. You can now view sales analytics in the Sales Analytics tab.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
