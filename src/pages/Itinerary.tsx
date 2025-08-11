import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Itinerary = () => {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{t('nav.itinerary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Itinerary planner coming soon with drag-and-drop functionality and smart travel optimization!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Itinerary;