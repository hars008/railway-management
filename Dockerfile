FROM node:18

# Create app directory
WORKDIR /be-app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "dev" ]