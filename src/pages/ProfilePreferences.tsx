import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save, MapPin, Home } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type UserType = "tourist" | "local" | "";

interface FormData {
  // User Type
  userType: UserType;
  lengthOfStay: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  arrivalTime: string;
  departureTime: string;
  accommodation: string;
  
  // Local-specific fields
  homeLocation: string;
  explorationRadius: string;
  interests: string[];
  pace: string;
  indoorOutdoorPreference: string;
  
  // Budget & Dining
  budget: string;
  mealPreference: string;
  
  // Dietary & Accessibility
  dietaryRestrictions: string[];
  customDietaryRestrictions: string;
  accessibilityNeeds: string;
  
  // Transport
  transportPreference: string;
  transferComfort: string;
  
  // Must-Do & Avoid
  mustVisitAttractions: string;
  mustTryFoods: string;
  avoidList: string;
  
  // Special Requests
  tripOccasion: string;
  specialActivities: string;
}

const ProfilePreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    userType: "",
    lengthOfStay: 3,
    startDate: undefined,
    endDate: undefined,
    arrivalTime: "",
    departureTime: "",
    accommodation: "",
    homeLocation: "",
    explorationRadius: "",
    interests: [],
    pace: "",
    indoorOutdoorPreference: "",
    budget: "",
    mealPreference: "",
    dietaryRestrictions: [],
    customDietaryRestrictions: "",
    accessibilityNeeds: "",
    transportPreference: "",
    transferComfort: "",
    mustVisitAttractions: "",
    mustTryFoods: "",
    avoidList: "",
    tripOccasion: "",
    specialActivities: ""
  });

  const totalSteps = !formData.userType ? 1 : (formData.userType === "tourist" ? 5 : 4);
  const progress = showOverview ? 100 : (!formData.userType ? 20 : (((currentStep + 1) / totalSteps) * 100));

  const interestOptions = [
    "Culture & History",
    "Nature & Wildlife", 
    "Shopping",
    "Food & Dining",
    "Adventure & Theme Parks",
    "Nightlife & Entertainment",
    "Arts & Performances"
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan", 
    "Halal",
    "Kosher",
    "Gluten-free",
    "Nut allergy",
    "Seafood allergy"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDietaryToggle = (dietary: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(dietary)
        ? prev.dietaryRestrictions.filter(d => d !== dietary)
        : [...prev.dietaryRestrictions, dietary]
    }));
  };

  const handleSaveProgress = () => {
    localStorage.setItem('singapore-profile-preferences', JSON.stringify(formData));
    toast({
      title: "Progress saved",
      description: "Your preferences have been saved. You can continue later.",
    });
  };

  const handleSubmit = () => {
    localStorage.setItem('singapore-profile-preferences', JSON.stringify(formData));
    setShowOverview(true);
    toast({
      title: "Profile complete!",
      description: "Your preferences have been saved. Review and edit if needed.",
    });
  };

  const handleSkip = () => {
    toast({
      title: "Skipped preferences",
      description: "You can always update your preferences later for better recommendations.",
    });
    navigate('/');
  };

  const handleEditSection = (section: number) => {
    setShowOverview(false);
    setCurrentStep(section);
  };

  const handleCreateItinerary = () => {
    toast({
      title: "Creating your itinerary",
      description: "Let's plan your perfect Singapore experience!",
    });
    navigate('/itinerary');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">Profile Complete! 🎉</h2>
        <p className="text-lg text-muted-foreground">
          Review your preferences below and make any changes if needed
        </p>
      </div>

      <div className="grid gap-4">
        {/* User Type Overview */}
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Profile Type</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formData.userType === "tourist" ? "Tourist visiting Singapore" : "Local exploring Singapore"}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection(0)}
            >
              Edit
            </Button>
          </CardHeader>
        </Card>

        {/* Basics Overview */}
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {formData.userType === "tourist" ? "Trip Details" : "Exploration Preferences"}
              </CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                {formData.userType === "tourist" ? (
                  <>
                    {formData.lengthOfStay && <p>Duration: {formData.lengthOfStay} days</p>}
                    {formData.startDate && <p>Start: {format(formData.startDate, "PPP")}</p>}
                    {formData.accommodation && <p>Staying at: {formData.accommodation}</p>}
                  </>
                ) : (
                  <>
                    {formData.homeLocation && <p>Home area: {formData.homeLocation}</p>}
                    {formData.explorationRadius && <p>Exploration radius: {formData.explorationRadius}</p>}
                    {formData.pace && <p>Time preference: {formData.pace}</p>}
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection(1)}
            >
              Edit
            </Button>
          </CardHeader>
        </Card>

        {/* Interests Overview */}
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Interests & Preferences</CardTitle>
              <div className="text-sm text-muted-foreground space-y-2">
                {formData.interests.length > 0 && (
                  <div>
                    <p className="font-medium">Interests:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {formData.userType === "tourist" && formData.pace && (
                  <p>Pace: {formData.pace}</p>
                )}
                {formData.indoorOutdoorPreference && (
                  <p>Environment: {formData.indoorOutdoorPreference}</p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection(2)}
            >
              Edit
            </Button>
          </CardHeader>
        </Card>

        {/* Budget & Dining Overview */}
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Budget & Dining</CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                {formData.budget && <p>Budget: {formData.budget}</p>}
                {formData.mealPreference && <p>Dining: {formData.mealPreference}</p>}
                {formData.dietaryRestrictions.length > 0 && (
                  <div>
                    <p className="font-medium">Dietary restrictions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.dietaryRestrictions.map((restriction) => (
                        <Badge key={restriction} variant="outline" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {formData.customDietaryRestrictions && (
                  <p>Other restrictions: {formData.customDietaryRestrictions}</p>
                )}
                {formData.accessibilityNeeds && (
                  <p>Accessibility: {formData.accessibilityNeeds}</p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection(3)}
            >
              Edit
            </Button>
          </CardHeader>
        </Card>

        {/* Transport & Additional Preferences (Tourists) or Discovery Preferences (Locals) */}
        {((formData.userType === "tourist" && (formData.transportPreference || formData.mustVisitAttractions)) || 
          (formData.userType === "local" && (formData.transportPreference || formData.mustVisitAttractions))) && (
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {formData.userType === "tourist" ? "Transport & Additional Preferences" : "Discovery Preferences"}
                </CardTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                  {formData.transportPreference && (
                    <p>Transport: {formData.transportPreference}</p>
                  )}
                  {formData.userType === "tourist" && formData.transferComfort && (
                    <p>Transfer comfort: {formData.transferComfort}</p>
                  )}
                  {formData.tripOccasion && (
                    <p>Occasion: {formData.tripOccasion}</p>
                  )}
                  {formData.mustVisitAttractions && (
                    <p>Must visit: {formData.mustVisitAttractions.substring(0, 100)}...</p>
                  )}
                  {formData.mustTryFoods && (
                    <p>Must try foods: {formData.mustTryFoods.substring(0, 100)}...</p>
                  )}
                  {formData.avoidList && (
                    <p>Avoid: {formData.avoidList.substring(0, 100)}...</p>
                  )}
                  {formData.specialActivities && (
                    <p>Special activities: {formData.specialActivities.substring(0, 100)}...</p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditSection(formData.userType === "tourist" ? 4 : 3)}
              >
                Edit
              </Button>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button 
          onClick={() => setShowOverview(false)}
          variant="outline"
          className="flex-1"
        >
          Continue Editing
        </Button>
        <Button 
          onClick={handleCreateItinerary}
          className="flex-1 bg-gradient-primary"
        >
          {formData.userType === "tourist" ? "Create My Itinerary" : "Get Recommendations"} →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleSaveProgress}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Progress
            </Button>
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Profile & Preferences</h1>
            {formData.userType && !showOverview && (
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Show Overview or Form */}
        {showOverview ? renderOverview() : (
          <Accordion 
            type="single" 
            value={`section-${currentStep}`} 
            onValueChange={(value) => {
              if (value) {
                const stepNumber = parseInt(value.replace('section-', ''));
                setCurrentStep(stepNumber);
              }
            }} 
            className="space-y-4"
          >
            {/* Section 0: User Type Selection - Always visible when no userType selected */}
            {!formData.userType && (
              <AccordionItem value="section-0" className="border rounded-lg" data-state="open">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(0)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary text-primary-foreground">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">I am a...</h3>
                    {formData.userType && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formData.userType === "tourist" ? "Tourist" : "Local"})
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        Help us customize your experience by selecting your profile type
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-lg border-2",
                            formData.userType === "tourist" ? "border-primary bg-primary/5" : "border-border"
                          )}
                          onClick={() => setFormData(prev => ({ ...prev, userType: "tourist" }))}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tourist</h3>
                            <p className="text-muted-foreground text-sm">
                              Visiting Singapore for leisure, business, or exploration
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-lg border-2",
                            formData.userType === "local" ? "border-primary bg-primary/5" : "border-border"
                          )}
                          onClick={() => setFormData(prev => ({ ...prev, userType: "local" }))}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                              <Home className="h-8 w-8 text-secondary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Local</h3>
                            <p className="text-muted-foreground text-sm">
                              Singapore resident looking to explore and discover
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  {formData.userType && (
                    <Button 
                      onClick={() => {
                        setCurrentStep(1);
                        // Small delay to ensure accordion updates properly
                        setTimeout(() => {
                          const nextSection = document.querySelector('[data-state="open"]');
                          if (nextSection) {
                            nextSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }, 100);
                      }} 
                      className="mt-6 w-full"
                    >
                      Continue as {formData.userType === "tourist" ? "Tourist" : "Local"}
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Section 1: Trip/Exploration Basics - Auto-expand when active */}
            {formData.userType && (
              <AccordionItem value="section-1" className="border rounded-lg">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      2
                    </div>
                    <h3 className="text-lg font-semibold">
                      {formData.userType === "tourist" ? "Trip Basics" : "Exploration Basics"}
                    </h3>
                    {currentStep > 1 && (
                      <span className="text-sm text-green-600">✓ Completed</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  {formData.userType === "tourist" ? (
                    // Tourist-specific fields
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Length of stay (days)</Label>
                        <div className="px-3">
                          <Slider
                            value={[formData.lengthOfStay]}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, lengthOfStay: value[0] }))}
                            max={14}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>1 day</span>
                            <span className="font-medium">{formData.lengthOfStay} days</span>
                            <span>14 days</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Travel dates</Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !formData.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(formData.startDate, "PPP") : "Start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.startDate}
                                onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !formData.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(formData.endDate, "PPP") : "End date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.endDate}
                                onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Arrival time</Label>
                        <Input
                          type="time"
                          value={formData.arrivalTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Departure time</Label>
                        <Input
                          type="time"
                          value={formData.departureTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Accommodation (hotel name or postal code)</Label>
                        <Input
                          placeholder="e.g., Marina Bay Sands or 018956"
                          value={formData.accommodation}
                          onChange={(e) => setFormData(prev => ({ ...prev, accommodation: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    // Local-specific fields
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Home Location (Area/District)</Label>
                        <Input
                          placeholder="e.g., Orchard, Tampines, CBD"
                          value={formData.homeLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, homeLocation: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Preferred exploration radius</Label>
                        <Select value={formData.explorationRadius} onValueChange={(value) => setFormData(prev => ({ ...prev, explorationRadius: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="How far are you willing to travel?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nearby">Stay nearby (same district)</SelectItem>
                            <SelectItem value="moderate">Moderate distance (neighboring areas)</SelectItem>
                            <SelectItem value="anywhere">Anywhere in Singapore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Time of day preference</Label>
                        <Select value={formData.pace} onValueChange={(value) => setFormData(prev => ({ ...prev, pace: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="When do you prefer to explore?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning explorer</SelectItem>
                            <SelectItem value="afternoon">Afternoon adventures</SelectItem>
                            <SelectItem value="evening">Evening outings</SelectItem>
                            <SelectItem value="flexible">Flexible timing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={() => {
                      setCurrentStep(2);
                      setTimeout(() => {
                        const nextSection = document.querySelector('[data-state="open"]');
                        if (nextSection) {
                          nextSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }, 100);
                    }} 
                    className="mt-6"
                  >
                    Next: Your Interests
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Additional sections would continue here with the same pattern... */}
            {/* For brevity, I'll include just the key sections that were causing errors */}
            {/* Section 2: Interests & Preferences - Auto-expand when active */}
            {formData.userType && (
              <AccordionItem value="section-2" className="border rounded-lg">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(2)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Your Interests</h3>
                    {currentStep > 2 && (
                      <span className="text-sm text-green-600">✓ Completed</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Main interests (select all that apply)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {interestOptions.map((interest) => (
                          <Badge
                            key={interest}
                            variant={formData.interests.includes(interest) ? "default" : "outline"}
                            className="cursor-pointer justify-center p-3 text-center"
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.userType === "tourist" && (
                        <div className="space-y-2">
                          <Label>Preferred pace</Label>
                          <Select value={formData.pace} onValueChange={(value) => setFormData(prev => ({ ...prev, pace: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred pace" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relaxed">Relaxed</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Indoor vs Outdoor preference</Label>
                        <Select value={formData.indoorOutdoorPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, indoorOutdoorPreference: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mostly-indoor">Mostly Indoor</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="mostly-outdoor">Mostly Outdoor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Previous
                    </Button>
                    <Button onClick={() => {
                      setCurrentStep(3);
                      setTimeout(() => {
                        const nextSection = document.querySelector('[data-state="open"]');
                        if (nextSection) {
                          nextSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }, 100);
                    }}>
                      Next: Budget & Dining
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Section 3: Budget, Dining & Accessibility - Auto-expand when active */}
            {formData.userType && (
              <AccordionItem value="section-3" className="border rounded-lg">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(3)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      4
                    </div>
                    <h3 className="text-lg font-semibold">Budget & Dining</h3>
                    {currentStep > 3 && (
                      <span className="text-sm text-green-600">✓ Completed</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Overall trip budget</Label>
                        <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low ($50-100/day)</SelectItem>
                            <SelectItem value="medium">Medium ($100-200/day)</SelectItem>
                            <SelectItem value="luxury">Luxury ($200+/day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Meal preference</Label>
                        <Select value={formData.mealPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, mealPreference: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dining preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hawker">Hawker Centre</SelectItem>
                            <SelectItem value="mid-range">Mid-range Restaurants</SelectItem>
                            <SelectItem value="fine-dining">Fine Dining</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Dietary restrictions (select all that apply)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {dietaryOptions.map((dietary) => (
                          <Badge
                            key={dietary}
                            variant={formData.dietaryRestrictions.includes(dietary) ? "default" : "outline"}
                            className="cursor-pointer justify-center p-3 text-center"
                            onClick={() => handleDietaryToggle(dietary)}
                          >
                            {dietary}
                          </Badge>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label>Other dietary restrictions</Label>
                        <Input
                          placeholder="Please specify any other dietary restrictions"
                          value={formData.customDietaryRestrictions}
                          onChange={(e) => setFormData(prev => ({ ...prev, customDietaryRestrictions: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Accessibility needs</Label>
                      <Textarea
                        placeholder="e.g., wheelchair access, minimal walking, mobility assistance, etc."
                        value={formData.accessibilityNeeds}
                        onChange={(e) => setFormData(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Previous
                    </Button>
                    <Button onClick={() => {
                      const nextStep = formData.userType === "tourist" ? 4 : 3;
                      setCurrentStep(nextStep);
                      setTimeout(() => {
                        const nextSection = document.querySelector('[data-state="open"]');
                        if (nextSection) {
                          nextSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }, 100);
                    }}>
                      {formData.userType === "tourist" ? "Next: Transport & Preferences" : "Complete Profile"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Section 4: Transport & Final Preferences (Tourists only) */}
            {formData.userType === "tourist" && (
              <AccordionItem value="section-4" className="border rounded-lg">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(4)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      5
                    </div>
                    <h3 className="text-lg font-semibold">Transport & Final Preferences</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Preferred transport</Label>
                        <Select value={formData.transportPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, transportPreference: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transport preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public Transport</SelectItem>
                            <SelectItem value="walking">Walking</SelectItem>
                            <SelectItem value="taxi">Taxi/Rideshare</SelectItem>
                            <SelectItem value="private">Private Car</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Comfort with transfers</Label>
                        <Select value={formData.transferComfort} onValueChange={(value) => setFormData(prev => ({ ...prev, transferComfort: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select comfort level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="few">Few transfers preferred</SelectItem>
                            <SelectItem value="many">Many transfers OK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Trip occasion</Label>
                        <Select value={formData.tripOccasion} onValueChange={(value) => setFormData(prev => ({ ...prev, tripOccasion: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occasion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="honeymoon">Honeymoon</SelectItem>
                            <SelectItem value="family">Family trip</SelectItem>
                            <SelectItem value="solo">Solo travel</SelectItem>
                            <SelectItem value="business">Business + leisure</SelectItem>
                            <SelectItem value="friends">Friends getaway</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Must-visit attractions</Label>
                      <Textarea
                        placeholder="List any specific attractions you absolutely must visit"
                        value={formData.mustVisitAttractions}
                        onChange={(e) => setFormData(prev => ({ ...prev, mustVisitAttractions: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Must-try foods (optional)</Label>
                      <Textarea
                        placeholder="Any specific dishes or foods you'd like to try"
                        value={formData.mustTryFoods}
                        onChange={(e) => setFormData(prev => ({ ...prev, mustTryFoods: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Avoid list</Label>
                      <Textarea
                        placeholder="Anything you'd prefer to avoid (crowds, late nights, certain cuisines, etc.)"
                        value={formData.avoidList}
                        onChange={(e) => setFormData(prev => ({ ...prev, avoidList: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Special activities or events</Label>
                      <Textarea
                        placeholder="Any festivals, concerts, exhibitions you'd like to attend"
                        value={formData.specialActivities}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialActivities: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Previous
                    </Button>
                    <Button onClick={handleSubmit} className="bg-gradient-primary">
                      Complete Profile & Create Itinerary
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Final Section for Locals */}
            {formData.userType === "local" && currentStep >= 3 && (
              <AccordionItem value="section-3" className="border rounded-lg">
                <AccordionTrigger 
                  className="px-6 hover:no-underline cursor-pointer"
                  onClick={() => setCurrentStep(3)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      4
                    </div>
                    <h3 className="text-lg font-semibold">Discovery Preferences</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Transport preference for exploration</Label>
                      <Select value={formData.transportPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, transportPreference: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="How do you prefer to get around?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public Transport (MRT/Bus)</SelectItem>
                          <SelectItem value="walking">Walking + Public Transport</SelectItem>
                          <SelectItem value="cycling">Cycling</SelectItem>
                          <SelectItem value="driving">Private Car</SelectItem>
                          <SelectItem value="mixed">Mix of all</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Areas you'd like to discover more</Label>
                      <Textarea
                        placeholder="e.g., Hidden gems in Chinatown, new cafes in Tiong Bahru, etc."
                        value={formData.mustVisitAttractions}
                        onChange={(e) => setFormData(prev => ({ ...prev, mustVisitAttractions: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>New experiences you're seeking</Label>
                      <Textarea
                        placeholder="e.g., Try new cuisines, attend cultural events, discover street art, etc."
                        value={formData.specialActivities}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialActivities: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>What to avoid during exploration</Label>
                      <Textarea
                        placeholder="e.g., Overly touristy areas, crowded places during peak hours, etc."
                        value={formData.avoidList}
                        onChange={(e) => setFormData(prev => ({ ...prev, avoidList: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Previous
                    </Button>
                    <Button onClick={handleSubmit} className="bg-gradient-primary">
                      Complete Profile & Get Recommendations
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default ProfilePreferences;