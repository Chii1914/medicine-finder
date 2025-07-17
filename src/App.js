import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MedicationDetails from './pages/MedicationDetails'
import AwsMap from './components/AwsMap'
import Test from './components/Test'
//test
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_rM34tt1Hb",
  client_id: "5mq1pojgeu31gujou1k1j23vq7",
  redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
  response_type: "code",
  scope: "phone openid email",
};


function App() {
  return (
    <AuthProvider {...cognitoAuthConfig}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/" element={<Test />} /> */}
        <Route path="/medications" element={<MedicationDetails/>} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
