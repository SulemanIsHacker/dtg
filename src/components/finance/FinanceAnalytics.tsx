import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const FinanceAnalytics = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Financial Analytics & Reports
          </CardTitle>
          <CardDescription>Charts and detailed financial reports coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Analytics dashboard under development</p>
            <p className="text-sm mt-2">Income trends, expense breakdowns, and profit analysis</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceAnalytics;
