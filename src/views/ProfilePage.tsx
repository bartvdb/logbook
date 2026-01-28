import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ProfileForm, PreferencesForm, CustomInstructions } from '@/components/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage: React.FC = () => {
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSaved = () => {
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Customize your experience and AI mentor preferences
        </p>
      </div>

      {savedMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          {savedMessage}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <ProfileForm onSaved={handleSaved} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardContent className="pt-6">
              <PreferencesForm onSaved={handleSaved} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="instructions">
          <Card>
            <CardContent className="pt-6">
              <CustomInstructions onSaved={handleSaved} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
