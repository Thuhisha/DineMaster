# 🍽️ DineMaster - Redefining Restaurant Reservations & Dining

*Built for the 2026 Innovation Hackathon*

## 🌟 The Vision

Have you ever tried to book a table at your favorite restaurant, only to find yourself calling multiple times, waiting on hold, and then showing up to find they lost your reservation? Or perhaps you've wanted to pre-order your favorite dish so it's hot and ready exactly when you sit down? 

**DineMaster** is born out of the simple human desire to make dining out a joyful, seamless experience again. We believe that technology should handle the logistics so that restaurants can focus on what they do best: creating unforgettable culinary experiences and building relationships with their guests.

DineMaster is a full-stack, comprehensive restaurant management platform that bridges the gap between hungry diners and busy kitchens. From real-time table availability and food pre-ordering, to chef queues and instant AWS-powered notifications, DineMaster handles the entire dining lifecycle.

## 🚀 Key Features
- **Smart Reservations:** Real-time table tracking. See exactly what's available and when.
- **Pre-order Integration:** Don't want to wait? Add menu items to your cart while booking a table.
- **Cloud-Native Notifications (AWS SNS):** Customers receive instant, secure email notifications the moment their reservation and order are confirmed.
- **Dynamic Menu Management (AWS S3):** Restaurant admins can effortlessly upload and manage high-quality mouth-watering images of their dishes, served directly from Amazon S3.
- **Chef & Admin Dashboards:** Dedicated portals for the kitchen staff to manage the cooking queue, and admins to oversee branch operations.

## 🛠️ Built With
- **Frontend:** React + Vite (Fast, responsive, and beautiful UI)
- **Backend:** Java Spring Boot (Microservices architecture for Auth and Main processing)
- **Database:** MongoDB (Flexible and scalable data storage)
- **Cloud:** AWS (S3 for object storage, SNS for event-driven email notifications)

---

## 👩‍⚖️ Note to Judges: Testing Instructions

Thank you so much for taking the time to review DineMaster! We wanted to make sure you have full access to everything we've built. 

Our frontend is deployed to Vercel, but because Vercel only hosts static sites and serverless functions, it cannot host our long-running **Java Spring Boot** backend services or our local MongoDB instance. 

To experience the full power of DineMaster, **you will need to run the backend locally while using the Vercel frontend link.** Don't worry, we've made it as easy as possible!

### How to Run and Test DineMaster:

**1. Start the Backend (Prerequisites: Java 17+, Maven, MongoDB)**
Make sure you have MongoDB running locally on port `27017`.
Clone this repository and run both microservices:
```bash
# Terminal 1: Auth Service (Runs on port 8081)
cd backend/auth-service
mvn spring-boot:run

# Terminal 2: Main Service (Runs on port 8082)
cd backend/main-service
mvn spring-boot:run
```

**2. Open the Live Frontend**
Once both Java services say `Started Application`, simply click our Vercel link! The live Vercel frontend is securely configured to communicate with your local backend ports (`localhost:8081` and `localhost:8082`).

**3. Explore as an Admin / Customer**
- **Test User Credentials:** You can register a new account on the live site, or use the test credentials below if provided in your hackathon portal.
- Try placing a reservation, uploading a menu image (S3), and watch the email notifications trigger (SNS)!

*Thank you for judging, and we hope you love DineMaster! ❤️*
