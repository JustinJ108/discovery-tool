import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import OrganizationsPage from './pages/OrganizationsPage'
import OrganizationDetailPage from './pages/OrganizationDetailPage'
import ContactsPage from './pages/ContactsPage'
import DiscoveryNotesPage from './pages/DiscoveryNotesPage'
import PainPointsPage from './pages/PainPointsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OrganizationsPage />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="discovery-notes" element={<DiscoveryNotesPage />} />
            <Route path="pain-points" element={<PainPointsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
