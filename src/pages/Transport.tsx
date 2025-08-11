import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Transport = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('nav.transport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Transport options coming soon with MRT, bus, taxi, and rideshare information!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transport;