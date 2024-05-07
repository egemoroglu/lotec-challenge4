Lotec-Challenge-4

In this challenge, the aim is to implement a React-ts project with the Vite bundler and implement necessary Amazon Web Services to serve the Project.

Functionality Requirements

- User should be able to sign up with a username and password (user existence must be verified)
- User should be able to sign up with the username and password (user existence must be verified)
- User should be able to add tasks and see the list of tasks
- User should be able to delete tasks
- User should be able to update the task title
- User should be able to mark a task as completed of incompleted
- User should be able to see the list of tasks as completed and incompleted separately

Technical Requirements

- Server side and client side must be seperated
- Both sides must have their own package.json files
- Both sides must be run separately on different terminals
- A docker image must be created of the Server side
- Client side must be built with Vite bundler

AWS Requirements (Prefer US or other server locations which Apprunner is available)
- Front end of the project must be served on an S3 bucket (Static Website should be enabled)
- Cloudfront must be configured to distribute the front end of the project
- Docker image of the the backend must be created and pushed in into ECR
- An apprunner service must pull the backend image from ECR and serve the backend
- Policies must be configured for Apprunner and S3 bucket for these services to communicate

Additionally, all the AWS configuration must be done via Terraform and AWS CLI must not be used to configure services. Terraform-state must be saved inside another S3 bucket.