# Home Away Project using Next.js

1. Create the pages in the app folder
2. Shadcn UI makes us write less CSS
3. Every Shadcn UI component has baked in accessibility

 - Create the Next.js app for the project
 - Set up the pages in app router
 - Install the shadcn components that are needed
 - Set up the Navbar and define the various components of Navbar like Logo, NavSearch, DarkMode, LinksDropdown,UserIcon and SignOutLink
 - Import the shadcn components inside the Navbar including Logo and NavSearch
 - Install the React icons library
 - Import the icons inside the Navbar
 - Copy the CSS for the custom theme we will use and set it up in globals.css
 - Set up the Navbar in layout.tsx

# asChild property in Radix UI
- in some component libraries like Radix UI, 
the asChild prop is used to pass the rendered component as a child of another component,
essentially allowing you to wrap an element with another component while retaining its original semantics and properties.

```js
import { Button } from '@radix-ui/react-button';

function App() {
  return (
    <Button asChild>
      <a href="https://example.com">Click me</a>
    </Button>
  );
}

export default App;

```

- In this example, the Button component from Radix UI will render an <a> (anchor) element with all the button styles and behaviors. 
- The asChild property allows you to wrap any element with the Button component, so you can use the anchor tag as a button and apply button-specific styles and behaviors to it.

### Dropdown Menu in Radix UI
- It has the following basic structure
```js
//Here the trigger is usually some button or Link
//Dropdown menu content is actually the list of items in the dropdown
<DropdownMenu>
    <DropdownMenuTrigger></DropdownMenuTrigger>
    <DropdownMenuContent></DropdownMenuContent>
</DropdownMenu>
```
- In Tailwind if we want to add custom values of pixels we can do it like this: max-w-[100px]

# Clerk Authentication


