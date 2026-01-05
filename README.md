# SPF Record Checker

A simple and interactive web application to check **SPF (Sender Policy Framework)** records for any domain. This tool helps users understand which mail servers are authorized to send emails on behalf of a domain.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react&logoColor=white)](https://reactjs.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

- **Simple Interface**  
  Enter a domain name and instantly view its SPF record.

- **Interactive Exploration**  
  Click on `include:` and `redirect=` directives to expand and view the SPF records of included domains.

- **Clear Formatting**  
  SPF records are parsed and color-coded for better readability.

- **Error Handling**  
  Provides clear feedback for invalid domains, missing records, or lookup failures.

- **Responsive Design**  
  Works seamlessly on desktop and mobile devices.

- **Loading Indicators**  
  Shows a loading spinner while fetching DNS records.


## 🚀 How to Run Locally

Follow these steps to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- **Node.js** (Must have version 18.17 or later recommended)  
- **npm** (comes with Node.js) or **yarn**

### Installation

1. **Clone the repository**

```
bash

git clone https://github.com/your-username/spf-checker-simple.git
cd spf-checker-simple
```

2. **Install Dependecies**

Using npm:
```
bash

npm install
```
Or using yarn: 
```
bash

yarn dev
```
3. **Run the development server**

Using npm:
```
bash

npm run dev
```
Or using yarn:
```
bash

yarn dev
```

## 🙌 Author

**Muhammad Musabbir** |
Junior Frontend Developer | Next.js Developer
