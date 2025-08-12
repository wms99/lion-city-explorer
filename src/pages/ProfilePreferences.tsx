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
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  // Trip Basics
  lengthOfStay: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  arrivalTime: string;
  departureTime: string;
  accommodation: string;
  
  // Interests & Preferences
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
  const [formData, setFormData] = useState<FormData>({
    lengthOfStay: 3,
    startDate: undefined,
    endDate: undefined,
    arrivalTime: "",
    departureTime: "",
    accommodation: "",
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

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
    toast({
      title: "Profile complete!",
      description: "Your preferences have been saved. Let's create your perfect itinerary.",
    });
    navigate('/itinerary');
  };

  const handleSkip = () => {
    toast({
      title: "Skipped preferences",
      description: "You can always update your preferences later for better recommendations.",
    });
    navigate('/');
  };

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
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Sections */}
        <Accordion type="single" value={`section-${currentStep}`} className="space-y-4">
          {/* Section 1: Trip Basics */}
          <AccordionItem value="section-0" className="border rounded-lg">
            <AccordionTrigger 
              className="px-6 hover:no-underline"
              onClick={() => setCurrentStep(0)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  1
                </div>
                <h3 className="text-lg font-semibold">Trip Basics</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
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
              <Button 
                onClick={() => setCurrentStep(1)} 
                className="mt-6"
              >
                Next: Your Interests
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Interests & Preferences */}
          <AccordionItem value="section-1" className="border rounded-lg">
            <AccordionTrigger 
              className="px-6 hover:no-underline"
              onClick={() => setCurrentStep(1)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  2
                </div>
                <h3 className="text-lg font-semibold">Your Interests</h3>
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
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  Previous
                </Button>
                <Button onClick={() => setCurrentStep(2)}>
                  Next: Budget & Dining
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Budget, Dining & Accessibility */}
          <AccordionItem value="section-2" className="border rounded-lg">
            <AccordionTrigger 
              className="px-6 hover:no-underline"
              onClick={() => setCurrentStep(2)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  3
                </div>
                <h3 className="text-lg font-semibold">Budget & Dining</h3>
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
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Next: Transport & Preferences
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: Transport & Final Preferences */}
          <AccordionItem value="section-3" className="border rounded-lg">
            <AccordionTrigger 
              className="px-6 hover:no-underline"
              onClick={() => setCurrentStep(3)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  4
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
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Previous
                </Button>
                <Button onClick={handleSubmit} className="bg-gradient-primary">
                  Complete Profile & Create Itinerary
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ProfilePreferences;