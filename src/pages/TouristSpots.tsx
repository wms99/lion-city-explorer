import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TouristSpots = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('nav.touristSpots')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tourist spots page coming soon with interactive Singapore map and clickable attractions!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristSpots;