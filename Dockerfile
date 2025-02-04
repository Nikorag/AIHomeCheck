# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the container
COPY package* .

# Install dependencies
RUN npm install

COPY . .

# Start the application
CMD ["npm", "run", "start"]