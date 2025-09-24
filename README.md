# Glenforest School Clubs Calendar

A modern, fast calendar website for displaying all Glenforest club events and meetings. Designed specifically for the library display (4-screen TV setup).

## Features

- **📅 Monthly Calendar View** - Clean, easy-to-read calendar display
- **🎨 Club Filtering** - Toggle visibility of different clubs (CS Club, Robotics, SAC, etc.)
- **✨ Event Management** - SAC-only admin panel for adding/editing/deleting events
- **🚀 Optimized Performance** - Fast loading and smooth navigation
- **📱 Responsive Design** - Works on all screen sizes
- **🌙 Dark Theme** - Easy on the eyes for library display

## For SAC Members - How to Manage Events

### Adding New Events
1. Click the blue **+** button at the bottom-right corner of the screen
2. Fill out the event form:
   - **Event Title**: Name of the event/meeting
   - **Club**: Select which club this event belongs to
   - **Date**: Pick the event date
   - **Time**: Optional - enter time (e.g., "3:30 PM")
   - **Description**: Optional - add extra details
3. Click **"Add Event"** to save

### Editing Events
1. Open the admin panel (blue + button)
2. Find the event in the "Recent Events" list
3. Click the **edit icon** (pencil) next to the event
4. Make your changes and click **"Update Event"**

### Deleting Events
1. Open the admin panel
2. Find the event in the "Recent Events" list
3. Click the **delete icon** (trash can) next to the event

### Club Colors
Each club has its own color for easy identification:
- **CS Club**: Blue
- **Robotics**: Red
- **SAC Meeting**: Green  
- **Volleyball**: Purple
- **Drama Club**: Orange
- **Debate Club**: Pink
- **Environmental Club**: Teal
- **Music Club**: Dark Red

## Running the Website

### Development Mode (for testing)
```bash
npm run dev
```
The website will be available at `http://localhost:3000`

### Production Mode (for library display)
```bash
npm run build
npm start
```

## File Structure

- `src/data/events.json` - All events and club data (easily editable)
- `src/components/` - All UI components
- `src/types/` - TypeScript definitions
- `src/utils/` - Date and utility functions

## Editing Events Directly (Alternative Method)

For bulk changes, SAC can also edit `src/data/events.json` directly:

```json
{
  "events": [
    {
      "id": "unique-id",
      "title": "CS Club Meeting",
      "clubId": "cs-club",
      "date": "2025-09-08",
      "time": "3:30 PM",
      "description": "Weekly programming session"
    }
  ]
}
```

## Display Setup for Library

1. Open the website in fullscreen mode (F11)
2. Navigate to the current month
3. Use club filters to show/hide specific clubs as needed
4. The calendar will automatically refresh and stay current

## Support

For technical issues or feature requests, contact the development team or create an issue in the project repository.

---

**Built for Glenforest Secondary School Student Council**  
*Optimized for large display viewing*
