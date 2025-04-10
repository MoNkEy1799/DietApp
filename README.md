# DietApp 🍩
A very basic PWA for tracking nutrition values and weight. It also offers options to save nurtitional values for foods and create receipes.

## Installation
The easiest way to install the PWA is via a USB connection and the `run_install_server.bat` file. The necessary steps are explained in the file. The USB drivers for android phones as well as the Android Debug Bridge is also provided in the repo. If the install prompt is not shown in the browser when accessing localhost:8000, use the 'add to home screen' option (in chromium based browsers).

## Features
### Person selector
At the top of the page you can track your diet for up to 2 different persons. The tracker values, weights, and settings are stored per person. Foods/receipes are shared by both.

### Tracker
In the 'tracker' tab you can see the current calories and protein amounts left for the day. By changing the day in the dropdown, you can view these values for yesterday or tomorrow. You can either add calories and proteins directly or enter an amount (in g) and a food name. While you type in a food name you automatically get suggestions based on your stored foods. You can then choose if you want to e.g. add these values for today or for tomorrow.

### Food
The 'food' tab allows you to add food items to the storage. Enter a name and the amount of calories and protein per 100g.

Containers are cooking containers (e.g. pots, pans, etc.) that you can store by giving them a name and providing the weight of the container. These are necessary for the receipes.

You can add a receipe by choosing an already added food and an amount (in g) to put into the receipe. All items in the current receipe are listed (and can be removed again). To save a receipe, choose a name and a container and provide the total weight of the cooked food + container (it is usually easier to measure the total weight). The app will then calculate the protein and calories per 100g for the receipe by dividing the total nutritional value by the total weight (excluding the container).

In the list below the add tabs, you can find all food items, receipes and containers. By clicking on an entry, you can view the nutritional value for foods and receipes, list all foods contained in a receipe, or show the weight of a container. Here, you also have the option to remove an entry.

### Weight
Add a body weight and a date to track your current weight and displays the progress on the graph.

### Settings
Here you can choose the daily amount of protein and calories for each person. You also have the option to save (and later read in) all stored data in the app to a .txt file. This is just for backup reasons since the app data will be deleted when the browser cache is deleted. So you can backup all stored foods/receipes/containers here. In the log table, the last executed commands are shown, in case you e.g. removed something by accident and want to see the original values.
