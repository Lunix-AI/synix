# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Enable Corepack and install the correct Yarn version
RUN corepack enable && corepack prepare yarn@4.3.1 --activate

# Copy package.json, yarn.lock, and the entire .yarn directory
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN yarn build

# Expose the ports the app runs on
EXPOSE 3000 1234

# Start both the server and the Remix app
CMD ["yarn", "start"]