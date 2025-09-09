#!/bin/bash

# Get the project ID from the Firebase config
PROJECT_ID=$(grep -o '"projectId": "[^"]*' src/lib/firebase.ts | grep -o '[^"]*$')

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not find project ID in src/lib/firebase.ts"
  exit 1
fi

BUCKET_NAME="${PROJECT_ID}.appspot.com"

echo "Configuring CORS for bucket: gs://${BUCKET_NAME}"

# Apply the CORS configuration to the bucket
gcloud storage buckets update "gs://${BUCKET_NAME}" --cors-file=./cors.json

echo "CORS configuration applied successfully."
