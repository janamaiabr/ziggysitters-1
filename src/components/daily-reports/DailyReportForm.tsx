import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, Heart, Clock, Utensils, Bed, Pill } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const reportSchema = z.object({
  exercise_duration: z.number().min(0, 'Exercise duration must be 0 or greater'),
  exercise_notes: z.string().optional(),
  medication_given: z.boolean().default(false),
  medication_notes: z.string().optional(),
  sleep_quality: z.enum(['excellent', 'good', 'fair', 'poor']),
  sleep_notes: z.string().optional(),
  time_alone_hours: z.number().min(0, 'Time alone must be 0 or greater'),
  food_consumption: z.enum(['all', 'most', 'some', 'little', 'none']),
  food_notes: z.string().optional(),
  general_notes: z.string().min(10, 'Please provide detailed notes (at least 10 characters)'),
  mood: z.enum(['very_happy', 'happy', 'content', 'anxious', 'sad']),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface DailyReportFormProps {
  bookingId: string;
  sitterId: string;
  reportDate: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function DailyReportForm({ bookingId, sitterId, reportDate, onSubmit, onCancel }: DailyReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      exercise_duration: 30,
      medication_given: false,
      sleep_quality: 'good',
      time_alone_hours: 2,
      food_consumption: 'all',
      general_notes: '',
      mood: 'happy',
    },
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files",
          variant: "destructive",
        });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `daily-reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(filePath);

        setUploadedPhotos(prev => [...prev, publicUrl]);
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: ReportFormData) => {
    // CRITICAL FIX: Validate general notes not empty/spaces-only
    if (!data.general_notes || !data.general_notes.trim() || data.general_notes.trim().length < 10) {
      toast({
        title: "Invalid Notes",
        description: "Please provide detailed notes (at least 10 meaningful characters).",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadedPhotos.length === 0) {
      toast({
        title: "Photo required",
        description: "Please upload at least one photo of the pet",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the daily report
      const reportData = {
        booking_id: bookingId,
        sitter_id: sitterId,
        report_date: reportDate,
        photo_urls: uploadedPhotos,
        exercise_duration: data.exercise_duration,
        exercise_notes: data.exercise_notes,
        medication_given: data.medication_given,
        medication_notes: data.medication_notes,
        sleep_quality: data.sleep_quality,
        sleep_notes: data.sleep_notes,
        time_alone_hours: data.time_alone_hours,
        food_consumption: data.food_consumption,
        food_notes: data.food_notes,
        general_notes: data.general_notes,
        mood: data.mood,
      };

      const { error } = await supabase
        .from('daily_reports')
        .insert(reportData);

      if (error) throw error;

      // Send email notification to pet owner
      await supabase.functions.invoke('send-daily-report-email', {
        body: {
          bookingId,
          reportDate,
          reportData: { ...data, photo_urls: uploadedPhotos }
        }
      });

      toast({
        title: "Report submitted successfully!",
        description: "The pet owner has been notified via email.",
      });

      onSubmit();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit daily report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { value: 'very_happy', label: '😊 Very Happy', color: 'text-green-600' },
    { value: 'happy', label: '😄 Happy', color: 'text-green-500' },
    { value: 'content', label: '😌 Content', color: 'text-blue-500' },
    { value: 'anxious', label: '😰 Anxious', color: 'text-yellow-500' },
    { value: 'sad', label: '😢 Sad', color: 'text-red-500' },
  ];

  const sleepOptions = [
    { value: 'excellent', label: 'Excellent - slept soundly all night' },
    { value: 'good', label: 'Good - slept well with minor disturbances' },
    { value: 'fair', label: 'Fair - restless but got some sleep' },
    { value: 'poor', label: 'Poor - very restless or barely slept' },
  ];

  const foodOptions = [
    { value: 'all', label: 'All - finished entire meal' },
    { value: 'most', label: 'Most - ate majority of food' },
    { value: 'some', label: 'Some - ate about half' },
    { value: 'little', label: 'Little - barely touched food' },
    { value: 'none', label: 'None - refused to eat' },
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Daily Pet Report - {new Date(reportDate).toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-4">
              <FormLabel className="text-base font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Pet Photos *
              </FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload photos</p>
                  <p className="text-xs text-gray-500 mt-1">At least 1 photo required</p>
                </label>
              </div>
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {uploadedPhotos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Pet photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exercise */}
              <div className="space-y-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Exercise & Activity
                </FormLabel>
                <FormField
                  control={form.control}
                  name="exercise_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exercise_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the type of exercise, energy level, any issues..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mood */}
              <div className="space-y-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pet's Mood
                </FormLabel>
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Mood Today</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {moodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={option.color}>{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time_alone_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Spent Alone (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food */}
              <div className="space-y-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Food & Eating
                </FormLabel>
                <FormField
                  control={form.control}
                  name="food_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Consumption</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How much did they eat?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {foodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="food_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any issues with eating, treats given, appetite changes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sleep */}
              <div className="space-y-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Sleep & Rest
                </FormLabel>
                <FormField
                  control={form.control}
                  name="sleep_quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Quality</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How well did they sleep?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sleepOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleep_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Where they slept, any disturbances, comfort issues..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medication */}
            <div className="space-y-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication & Health
              </FormLabel>
              <FormField
                control={form.control}
                name="medication_given"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Medication was given today</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medication_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication & Health Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Medication given, dosage, times, any health observations..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* General Notes */}
            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">General Notes & Highlights *</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px]"
                      placeholder="Describe the pet's day in detail. Include any special moments, behaviors, interactions, activities, or concerns. The more detail, the better for the pet owner!"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is what the pet owner will see first. Make it personal and detailed!
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Report & Notify Owner'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}