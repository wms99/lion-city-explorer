import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings page coming soon with preferences, notifications, and account management!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;