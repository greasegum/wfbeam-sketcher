# WFBeam Sketcher - Test Launch Script
#
# This script launches the Vite dev server and opens the beam cross-section test sandbox in your browser.
# Use this to consistently test and develop rendering/annotation features in isolation before integrating
# them into the main app.

# Start Vite dev server (if not already running)
Start-Process powershell -ArgumentList 'npm run dev' -WindowStyle Minimized

# Wait a few seconds for the server to start
Start-Sleep -Seconds 3

# Open the test file in the default browser
Start-Process "http://localhost:5173/examples/beam-rendering/test-cross-section.html" 