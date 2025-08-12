import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star, Calendar, Trash2, Plus, Route, GripVertical } from "lucide-react";
import { singaporeAttractions, getCategoryColor, type Attraction } from "@/data/attractions";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItineraryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  suggestedDuration?: number; // in minutes
  optimalTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  visitType?: 'quick' | 'standard' | 'extended';
  day?: number;
}

interface DaySchedule {
  day: number;
  date: string;
  items: (ItineraryItem & { 
    attraction: Attraction; 
    timeSlot: string; 
    duration: string; 
    travelTime?: string;
    openingConflict?: boolean;
  })[];
  totalDuration: number;
  startTime: string;
  endTime: string;
}

const Itinerary = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  useEffect(() => {
    const loadItinerary = () => {
      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
      setSavedItems(saved);
      const schedules = generateDaySchedules(saved);
      setDaySchedules(schedules);
      generateScheduleSuggestions(saved, schedules);
    };

    loadItinerary();
  }, []);

  // Parse opening hours to check if attraction is open at specific time
  const isAttractionOpen = (attraction: Attraction, timeInMinutes: number): boolean => {
    const hours = attraction.openingHours.toLowerCase();
    
    // Handle 24/7 attractions
    if (hours.includes('24/7') || hours.includes('24 hours')) return true;
    
    // Extract opening and closing times using regex
    const timeMatch = hours.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*-\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
    if (!timeMatch) return true; // If we can't parse, assume it's open
    
    const [, openHour, openMin = '00', openPeriod, closeHour, closeMin = '00', closePeriod] = timeMatch;
    
    let openTime = parseInt(openHour) * 60 + parseInt(openMin);
    let closeTime = parseInt(closeHour) * 60 + parseInt(closeMin);
    
    // Convert to 24-hour format
    if (openPeriod?.toLowerCase() === 'pm' && parseInt(openHour) !== 12) openTime += 12 * 60;
    if (closePeriod?.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) closeTime += 12 * 60;
    if (openPeriod?.toLowerCase() === 'am' && parseInt(openHour) === 12) openTime = parseInt(openMin);
    if (closePeriod?.toLowerCase() === 'am' && parseInt(closeHour) === 12) closeTime = parseInt(closeMin);
    
    // Handle overnight operations (e.g., 6 PM - 2 AM)
    if (closeTime < openTime) {
      return timeInMinutes >= openTime || timeInMinutes <= closeTime;
    }
    
    return timeInMinutes >= openTime && timeInMinutes <= closeTime;
  };

  const generateScheduleSuggestions = (items: ItineraryItem[], schedules: DaySchedule[]) => {
    if (items.length === 0) {
      setScheduleSuggestions([]);
      return;
    }

    const suggestions = [];
    const attractions = items.map(item => getAttractionDetails(item.id)).filter(Boolean);
    
    // Multi-day schedule insights
    if (schedules.length > 1) {
      suggestions.push(`📅 ${schedules.length}-day itinerary created! Each day is optimized for opening hours and travel efficiency.`);
    }
    
    // Check for opening hour conflicts
    const conflictDays = schedules.filter(day => 
      day.items.some(item => item.openingConflict)
    );
    
    if (conflictDays.length > 0) {
      suggestions.push(`⚠️ Some attractions may be closed during scheduled times on Day ${conflictDays.map(d => d.day).join(', ')}. Check opening hours before visiting.`);
    }
    
    // Calculate total estimated time across all days
    const totalDuration = schedules.reduce((total, day) => total + day.totalDuration, 0);
    
    const totalHours = Math.ceil(totalDuration / 60);
    
    // Duration-based suggestions with multi-day context
    if (schedules.length === 1) {
      if (totalHours < 4) {
        suggestions.push(`Perfect half-day itinerary! Your ${totalHours}-hour schedule allows for a relaxed pace with time for meals.`);
      } else if (totalHours <= 8) {
        suggestions.push(`Great full-day adventure! Plan for ${totalHours} hours with meal breaks included.`);
      }
    } else {
      suggestions.push(`Multi-day adventure spanning ${totalHours} total hours across ${schedules.length} days.`);
    }
    
    // Category-specific suggestions
    const categories = attractions.map(a => a!.category);
    const hasFood = categories.includes('food');
    const hasCulture = categories.includes('culture');
    const hasTourist = categories.includes('tourist');
    const hasShopping = categories.includes('shopping');
    
    if (!hasFood && items.length >= 2) {
      suggestions.push("💡 Add a hawker center or restaurant between attractions for authentic Singapore cuisine.");
    }
    
    if (hasCulture && hasTourist) {
      suggestions.push("🌅 Visit cultural sites (Chinatown, Little India) in the morning when it's cooler and less crowded.");
    }
    
    if (attractions.some(a => a!.id === 'gardens-by-the-bay')) {
      suggestions.push("✨ Gardens by the Bay is spectacular at sunset - plan your visit for 6-8 PM for the light show.");
    }
    
    if (attractions.some(a => a!.id === 'marina-bay-sands')) {
      suggestions.push("🏙️ Marina Bay Sands SkyPark offers stunning views - consider visiting during golden hour or after dark.");
    }
    
    if (attractions.some(a => a!.id === 'sentosa-island' || a!.id === 'universal-studios')) {
      suggestions.push("🎢 Sentosa/Universal Studios are full-day destinations - allocate 6-8 hours and start early!");
    }
    
    // Practical tips based on attractions
    const outdoorAttractions = attractions.filter(a => 
      ['singapore-zoo', 'singapore-botanic-gardens', 'east-coast-park', 'sentosa-island'].includes(a!.id)
    );
    
    if (outdoorAttractions.length >= 2) {
      suggestions.push("☀️ Multiple outdoor attractions detected - bring sunscreen, water, and plan for Singapore's tropical weather.");
    }
    
    // Transportation tips
    if (items.length >= 3) {
      suggestions.push("🚇 Group nearby attractions: Marina Bay area, Chinatown/Chinatown Heritage, Orchard Road for efficient travel.");
      suggestions.push("📱 Download the Singapore MRT app for real-time public transport directions between attractions.");
    }
    
    // Advanced booking suggestions
    const needsBooking = attractions.filter(a => 
      ['marina-bay-sands', 'singapore-flyer', 'universal-studios', 'night-safari'].includes(a!.id)
    );
    
    if (needsBooking.length > 0) {
      suggestions.push("🎫 Book tickets online in advance for popular attractions to skip queues and save money.");
    }

    setScheduleSuggestions(suggestions);
  };

  const removeFromItinerary = (id: string) => {
    const updatedItems = savedItems.filter(item => item.id !== id);
    setSavedItems(updatedItems);
    localStorage.setItem('singapore-itinerary', JSON.stringify(updatedItems));
    const schedules = generateDaySchedules(updatedItems);
    setDaySchedules(schedules);
    generateScheduleSuggestions(updatedItems, schedules);
    
    toast({
      title: "Removed from itinerary",
      description: "Item has been removed from your itinerary.",
      variant: "default"
    });
  };

  const handleScheduleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Parse the active and over IDs to get item and container info
    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Extract the item IDs from the draggable data
    const activeItemId = activeData.sortable ? active.id as string : activeData.itemId;
    const overItemId = overData.sortable ? over.id as string : overData.itemId;
    const overDay = overData.day;
    const overTimeSlot = overData.timeSlot;

    // Find the schedules containing these items
    let sourceSchedule: DaySchedule | null = null;
    let sourceIndex = -1;
    let targetSchedule: DaySchedule | null = null;
    let targetIndex = -1;

    // Find source item
    for (const schedule of daySchedules) {
      const itemIndex = schedule.items.findIndex(item => item.id === activeItemId);
      if (itemIndex !== -1) {
        sourceSchedule = schedule;
        sourceIndex = itemIndex;
        break;
      }
    }

    // Find target position
    if (overData.sortable) {
      // Dropped on another item
      for (const schedule of daySchedules) {
        const itemIndex = schedule.items.findIndex(item => item.id === overItemId);
        if (itemIndex !== -1) {
          targetSchedule = schedule;
          targetIndex = itemIndex;
          break;
        }
      }
    } else {
      // Dropped on a time slot container
      targetSchedule = daySchedules.find(s => s.day === overDay) || null;
      if (targetSchedule) {
        // Find the last item in this time slot or end of day
        const timeSlotItems = targetSchedule.items.filter(item => {
          const itemHour = parseInt(item.timeSlot.split(':')[0]);
          if (overTimeSlot === 'morning') return itemHour < 12;
          if (overTimeSlot === 'afternoon') return itemHour >= 12 && itemHour < 18;
          if (overTimeSlot === 'evening') return itemHour >= 18 && itemHour < 21;
          return itemHour >= 21;
        });
        targetIndex = timeSlotItems.length;
      }
    }

    if (!sourceSchedule || !targetSchedule || sourceIndex === -1) return;

    const sourceItem = sourceSchedule.items[sourceIndex];

    // Create updated schedules
    const updatedSchedules = daySchedules.map(schedule => {
      if (schedule.day === sourceSchedule!.day) {
        // Remove from source
        return {
          ...schedule,
          items: schedule.items.filter((_, index) => index !== sourceIndex)
        };
      }
      if (schedule.day === targetSchedule!.day) {
        // Add to target
        const newItems = [...schedule.items];
        if (targetIndex >= newItems.length) {
          newItems.push(sourceItem);
        } else {
          newItems.splice(targetIndex, 0, sourceItem);
        }
        return {
          ...schedule,
          items: newItems
        };
      }
      return schedule;
    });

    // Update the main items array to reflect new order
    const newItems: ItineraryItem[] = [];
    updatedSchedules.forEach(schedule => {
      schedule.items.forEach(item => {
        newItems.push({
          id: item.id,
          name: item.name,
          category: item.category,
          addedAt: item.addedAt,
          suggestedDuration: item.suggestedDuration,
          optimalTimeSlot: item.optimalTimeSlot,
          visitType: item.visitType,
          day: schedule.day
        });
      });
    });

    setSavedItems(newItems);
    localStorage.setItem('singapore-itinerary', JSON.stringify(newItems));
    
    // Regenerate schedules with proper timing
    const freshSchedules = generateDaySchedules(newItems);
    setDaySchedules(freshSchedules);
    generateScheduleSuggestions(newItems, freshSchedules);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearItinerary = () => {
    setSavedItems([]);
    localStorage.setItem('singapore-itinerary', JSON.stringify([]));
    setDaySchedules([]);
    setScheduleSuggestions([]);
    setSelectedDay(1);
    
    toast({
      title: "Itinerary cleared",
      description: "All items have been removed from your itinerary.",
      variant: "default"
    });
  };

  const getAttractionDetails = (id: string): Attraction | null => {
    return singaporeAttractions.find(attraction => attraction.id === id) || null;
  };

  // Research-based duration recommendations (in minutes)
  const getAttractionDuration = (attraction: Attraction, visitType: 'quick' | 'standard' | 'extended' = 'standard'): number => {
    const baseDurations: Record<string, { quick: number; standard: number; extended: number }> = {
      // Major Tourist Attractions
      'marina-bay-sands': { quick: 60, standard: 120, extended: 180 },
      'gardens-by-the-bay': { quick: 90, standard: 150, extended: 240 },
      'sentosa-island': { quick: 240, standard: 480, extended: 720 }, // Full day destination
      'singapore-zoo': { quick: 120, standard: 180, extended: 300 },
      'universal-studios': { quick: 300, standard: 480, extended: 600 }, // Theme park - full day
      'singapore-flyer': { quick: 45, standard: 60, extended: 90 },
      'night-safari': { quick: 120, standard: 180, extended: 240 },
      'jurong-bird-park': { quick: 120, standard: 180, extended: 240 },
      'sea-aquarium': { quick: 90, standard: 120, extended: 180 },
      'singapore-botanic-gardens': { quick: 60, standard: 120, extended: 180 },
      'raffles-hotel': { quick: 30, standard: 45, extended: 75 },
      
      // Cultural Sites
      'chinatown': { quick: 60, standard: 120, extended: 180 },
      'little-india': { quick: 60, standard: 90, extended: 150 },
      'kampong-glam': { quick: 45, standard: 75, extended: 120 },
      'haw-par-villa': { quick: 45, standard: 90, extended: 120 },
      
      // Quick Visits
      'merlion-park': { quick: 20, standard: 30, extended: 45 },
      'clarke-quay': { quick: 45, standard: 90, extended: 180 },
      
      // Food Centers
      'hawker-centres': { quick: 30, standard: 60, extended: 90 },
      'newton-food-centre': { quick: 30, standard: 60, extended: 90 },
      'lau-pa-sat': { quick: 30, standard: 45, extended: 75 },
      'east-coast-park': { quick: 45, standard: 90, extended: 150 },
      'holland-village': { quick: 45, standard: 75, extended: 120 },
      
      // Shopping
      'orchard-road': { quick: 60, standard: 180, extended: 360 }, // Shopping can take all day
    };

    const duration = baseDurations[attraction.id] || { quick: 60, standard: 90, extended: 120 };
    return duration[visitType];
  };

  // Determine optimal time slot based on attraction type and characteristics
  const getOptimalTimeSlot = (attraction: Attraction): 'morning' | 'afternoon' | 'evening' | 'night' => {
    // Night-specific attractions
    if (attraction.id === 'night-safari' || attraction.id === 'clarke-quay') return 'night';
    
    // Evening attractions (better lighting, cooler)
    if (attraction.id === 'gardens-by-the-bay' || attraction.id === 'singapore-flyer' || 
        attraction.id === 'marina-bay-sands') return 'evening';
    
    // Morning attractions (cooler weather, fewer crowds)
    if (attraction.category === 'culture' || attraction.id === 'singapore-zoo' || 
        attraction.id === 'singapore-botanic-gardens' || attraction.id === 'jurong-bird-park') return 'morning';
    
    // Food centers for meal times
    if (attraction.category === 'food') {
      if (attraction.id.includes('newton') || attraction.id.includes('clarke')) return 'night';
      return 'afternoon'; // Most food centers for lunch/dinner
    }
    
    // Shopping in afternoon (avoid morning rush, cool indoor environment)
    if (attraction.category === 'shopping') return 'afternoon';
    
    // Default to afternoon for most tourist attractions
    return 'afternoon';
  };

  // Generate multi-day schedules with opening hours consideration
  const generateDaySchedules = (items: ItineraryItem[]): DaySchedule[] => {
    if (items.length === 0) return [];
    
    // Get attraction details with enhanced duration info
    const itemsWithDetails = items.map(item => {
      const attraction = getAttractionDetails(item.id);
      if (!attraction) return null;
      
      const suggestedDuration = getAttractionDuration(attraction);
      const optimalTimeSlot = getOptimalTimeSlot(attraction);
      
      return {
        ...item,
        attraction,
        suggestedDuration,
        optimalTimeSlot,
        visitType: 'standard' as const
      };
    }).filter(Boolean);

    // Sort by optimal time slot priority
    const timeSlotPriority = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    const sortedItems = itemsWithDetails.sort((a, b) => {
      const aPriority = timeSlotPriority[a.optimalTimeSlot];
      const bPriority = timeSlotPriority[b.optimalTimeSlot];
      return aPriority - bPriority;
    });

    // Split into days (max 8-10 hours per day)
    const maxDailyDuration = 8 * 60; // 8 hours in minutes
    const days: DaySchedule[] = [];
    let currentDay: typeof sortedItems = [];
    let currentDayDuration = 0;

    for (const item of sortedItems) {
      const itemDuration = item.suggestedDuration + 30; // Include travel time
      
      // Check if adding this item would exceed daily limit or if it's a full-day attraction
      const isFullDayAttraction = item.suggestedDuration > 4 * 60; // 4+ hours
      const wouldExceedLimit = currentDayDuration + itemDuration > maxDailyDuration;
      
      if (wouldExceedLimit && currentDay.length > 0 || isFullDayAttraction && currentDay.length > 0) {
        // Create a day from current items
        const daySchedule = createDaySchedule(currentDay, days.length + 1);
        days.push(daySchedule);
        
        // Start new day
        currentDay = [item];
        currentDayDuration = itemDuration;
      } else {
        currentDay.push(item);
        currentDayDuration += itemDuration;
      }
    }

    // Add remaining items as final day
    if (currentDay.length > 0) {
      const daySchedule = createDaySchedule(currentDay, days.length + 1);
      days.push(daySchedule);
    }

    return days;
  };

  const createDaySchedule = (items: Array<ItineraryItem & { attraction: Attraction; suggestedDuration: number; optimalTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night'; visitType: 'standard' }>, dayNumber: number): DaySchedule => {
    let currentTime = 9 * 60; // Start at 9:00 AM (in minutes)
    const today = new Date();
    const dayDate = new Date(today.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
    
    const scheduledItems = items.map((item, index) => {
      const duration = item.suggestedDuration;
      const startHour = Math.floor(currentTime / 60);
      const startMin = currentTime % 60;
      const endTime = currentTime + duration;
      const endHour = Math.floor(endTime / 60);
      const endMin = endTime % 60;
      
      // Check if attraction is open at scheduled time
      const openingConflict = !isAttractionOpen(item.attraction, currentTime);
      
      const timeSlot = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      // Add travel time between attractions (15-30 min depending on distance)
      const travelTime = index < items.length - 1 ? 30 : 0;
      currentTime = endTime + travelTime;
      
      // Add meal breaks for long schedules
      if (currentTime > 12 * 60 && currentTime < 13 * 60 && index < items.length - 1) {
        currentTime = 13 * 60; // Lunch break until 1 PM
      }
      if (currentTime > 18 * 60 && currentTime < 19 * 60 && index < items.length - 1) {
        currentTime = 19 * 60; // Dinner break until 7 PM
      }
      
      return {
        ...item,
        timeSlot,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        travelTime: travelTime > 0 ? `${travelTime}m travel` : undefined,
        openingConflict
      };
    });
    
    const totalDuration = items.reduce((total, item) => total + item.suggestedDuration, 0);
    const startTime = scheduledItems.length > 0 ? scheduledItems[0].timeSlot.split(' - ')[0] : '09:00';
    const endTime = scheduledItems.length > 0 ? scheduledItems[scheduledItems.length - 1].timeSlot.split(' - ')[1] : '09:00';
    
    return {
      day: dayNumber,
      date: dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      items: scheduledItems,
      totalDuration,
      startTime,
      endTime
    };
  };

  // Sortable Schedule Item Component
  const SortableScheduleItem = ({ item, index }: {
    item: DaySchedule['items'][0];
    index: number;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: item.id,
      data: {
        sortable: true,
        itemId: item.id,
      }
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-smooth"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
          <span className="font-medium text-sm">{item.timeSlot}</span>
          <GripVertical className="h-4 w-4 text-muted-foreground ml-auto" />
          {item.openingConflict && (
            <Badge variant="destructive" className="text-xs">
              Check Hours
            </Badge>
          )}
        </div>
        <div className="ml-8">
          <h5 className="font-medium">{item.attraction?.name}</h5>
          <p className="text-xs text-muted-foreground">
            Duration: {item.duration}
            {item.openingConflict && (
              <span className="text-destructive ml-2">
                • Opens: {item.attraction?.openingHours}
              </span>
            )}
          </p>
          {item.travelTime && (
            <p className="text-xs text-muted-foreground italic">+ {item.travelTime}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Itinerary Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan your perfect Singapore adventure with personalized schedule recommendations
            </p>
          </div>
          
          {savedItems.length > 0 && (
            <Button 
              onClick={clearItinerary}
              variant="outline" 
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {savedItems.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your itinerary is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start adding attractions from the Explore Spots page to build your perfect Singapore adventure!
              </p>
              <Button onClick={() => window.location.href = '/tourist-spots'}>
                <Plus className="h-4 w-4 mr-2" />
                Explore Spots
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule & Recommendations */}
            <div className="lg:col-span-2 space-y-4">
              {/* Itinerary Overview */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Itinerary Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{savedItems.length}</div>
                      <div className="text-xs text-muted-foreground">Total Attractions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {(() => {
                          const totalMinutes = savedItems.reduce((total, item) => {
                            const attraction = getAttractionDetails(item.id);
                            return total + (attraction ? getAttractionDuration(attraction) : 90);
                          }, 0);
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground">Est. Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{daySchedules.length}</div>
                      <div className="text-xs text-muted-foreground">Days Planned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day Filter */}
              {daySchedules.length > 1 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Select Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {daySchedules.map((day) => (
                        <Button
                          key={day.day}
                          variant={selectedDay === day.day ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedDay(day.day)}
                          className="flex flex-col h-auto py-2 px-3"
                        >
                          <span className="font-medium">Day {day.day}</span>
                          <span className="text-xs opacity-75">{day.date}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Day Schedule with Drag and Drop */}
              {daySchedules.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Route className="h-5 w-5 mr-2" />
                      {daySchedules.length > 1 ? `Day ${selectedDay} Schedule` : 'Suggested Schedule'}
                    </CardTitle>
                    {daySchedules.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {daySchedules.find(d => d.day === selectedDay)?.date} • 
                        {daySchedules.find(d => d.day === selectedDay)?.startTime} - 
                        {daySchedules.find(d => d.day === selectedDay)?.endTime} • 
                        {Math.ceil((daySchedules.find(d => d.day === selectedDay)?.totalDuration || 0) / 60)}h total
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleScheduleDragEnd}
                    >
                      <div className="space-y-6">
                        {/* Morning Section */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                            Morning (9:00 - 12:00)
                          </h4>
                          <SortableContext 
                            items={daySchedules.find(d => d.day === selectedDay)?.items
                              .filter(item => parseInt(item.timeSlot.split(':')[0]) < 12)
                              .map(item => item.id) || []} 
                            strategy={verticalListSortingStrategy}
                          >
                            <div 
                              className="min-h-[60px] border-2 border-dashed border-muted rounded-lg p-3 space-y-2"
                              data-droppable="true"
                              data-day={selectedDay}
                              data-time-slot="morning"
                            >
                              {daySchedules.find(d => d.day === selectedDay)?.items
                                .filter(item => parseInt(item.timeSlot.split(':')[0]) < 12)
                                .map((item, index) => (
                                  <SortableScheduleItem key={item.id} item={item} index={index} />
                                )) || <p className="text-muted-foreground text-xs">Drop attractions here for morning</p>}
                            </div>
                          </SortableContext>
                        </div>

                        {/* Afternoon Section */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                            Afternoon (12:00 - 18:00)
                          </h4>
                          <SortableContext 
                            items={daySchedules.find(d => d.day === selectedDay)?.items
                              .filter(item => {
                                const hour = parseInt(item.timeSlot.split(':')[0]);
                                return hour >= 12 && hour < 18;
                              })
                              .map(item => item.id) || []} 
                            strategy={verticalListSortingStrategy}
                          >
                            <div 
                              className="min-h-[60px] border-2 border-dashed border-muted rounded-lg p-3 space-y-2"
                              data-droppable="true"
                              data-day={selectedDay}
                              data-time-slot="afternoon"
                            >
                              {daySchedules.find(d => d.day === selectedDay)?.items
                                .filter(item => {
                                  const hour = parseInt(item.timeSlot.split(':')[0]);
                                  return hour >= 12 && hour < 18;
                                })
                                .map((item, index) => (
                                  <SortableScheduleItem key={item.id} item={item} index={index} />
                                )) || <p className="text-muted-foreground text-xs">Drop attractions here for afternoon</p>}
                            </div>
                          </SortableContext>
                        </div>

                        {/* Evening Section */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                            Evening (18:00+)
                          </h4>
                          <SortableContext 
                            items={daySchedules.find(d => d.day === selectedDay)?.items
                              .filter(item => parseInt(item.timeSlot.split(':')[0]) >= 18)
                              .map(item => item.id) || []} 
                            strategy={verticalListSortingStrategy}
                          >
                            <div 
                              className="min-h-[60px] border-2 border-dashed border-muted rounded-lg p-3 space-y-2"
                              data-droppable="true"
                              data-day={selectedDay}
                              data-time-slot="evening"
                            >
                              {daySchedules.find(d => d.day === selectedDay)?.items
                                .filter(item => parseInt(item.timeSlot.split(':')[0]) >= 18)
                                .map((item, index) => (
                                  <SortableScheduleItem key={item.id} item={item} index={index} />
                                )) || <p className="text-muted-foreground text-xs">Drop attractions here for evening</p>}
                            </div>
                          </SortableContext>
                        </div>
                      </div>
                    </DndContext>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Your Attractions */}
            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Your Attractions ({savedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Remove drag and drop from attractions list */}
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:shadow-sm transition-smooth"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-base truncate pr-2">{getAttractionDetails(item.id)?.name}</h4>
                          <Button
                            onClick={() => removeFromItinerary(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 flex-shrink-0"
                            title="Remove from itinerary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getCategoryColor(getAttractionDetails(item.id)?.category || 'tourist')}>
                            {getAttractionDetails(item.id)?.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{getAttractionDetails(item.id)?.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {getAttractionDetails(item.id)?.description}
                        </p>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{getAttractionDetails(item.id)?.openingHours}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{getAttractionDetails(item.id)?.ticketPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Smart Recommendations */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Smart Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scheduleSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;