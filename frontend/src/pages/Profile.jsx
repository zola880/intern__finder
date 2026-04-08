import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  GraduationCap, 
  Target, 
  MapPin, 
  Save, 
  Bookmark, 
  Settings,
  LogOut,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import api from "../services/api";
import InternshipCard from "../components/InternshipCard";

const Profile = () => {
  const { user, updateProfile, logout, loading: authLoading } = useProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    department: user?.department || "",
    university: user?.university || "",
    city: user?.city || "",
    year: user?.year || "1",
    experienceLevel: user?.experienceLevel || "Beginner",
    goal: user?.goal || "",
    location: user?.location || "Addis Ababa",
    interests: user?.interests || [],
  });
  const [savedInternships, setSavedInternships] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  
  // Custom fields for "Other" selections
  const [customUniversity, setCustomUniversity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [showCustomCity, setShowCustomCity] = useState(false);

  const ethiopianUniversities = [
    "Addis Ababa University",
    "Adama Science and Technology University",
    "Bahir Dar University",
    "Jimma University",
    "Haramaya University",
    "Mekelle University",
    "University of Gondar",
    "Hawassa University",
    "Dire Dawa University",
    "Arba Minch University"
  ];

  const ethiopianCities = [
    "Addis Ababa",
    "Adama",
    "Bahir Dar",
    "Gondar",
    "Hawassa",
    "Mekelle",
    "Dire Dawa",
    "Jimma",
    "Dessie",
    "Harar"
  ];

  const departmentSuggestions = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Cybersecurity",
    "Information Systems",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Economics",
    "Accounting",
    "Marketing",
    "Law",
    "Medicine",
    "Nursing",
    "Pharmacy"
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        department: user.department || "",
        university: user.university || "",
        city: user.city || "",
        year: user.year || "1",
        experienceLevel: user.experienceLevel || "Beginner",
        goal: user.goal || "",
        location: user.location || "Addis Ababa",
        interests: user.interests || [],
      });
      
      // Check if university is custom (not in list)
      if (user.university && !ethiopianUniversities.includes(user.university)) {
        setShowCustomUniversity(true);
        setCustomUniversity(user.university);
      }
      if (user.city && !ethiopianCities.includes(user.city)) {
        setShowCustomCity(true);
        setCustomCity(user.city);
      }
      
      const fetchSaved = async () => {
        try {
          const { data } = await api.get("/saved");
          setSavedInternships(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSaved(false);
        }
      };
      fetchSaved();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'university') {
      if (value === 'other') {
        setShowCustomUniversity(true);
        setFormData({ ...formData, university: '' });
      } else {
        setShowCustomUniversity(false);
        setFormData({ ...formData, university: value });
      }
    } else if (name === 'city') {
      if (value === 'other') {
        setShowCustomCity(true);
        setFormData({ ...formData, city: '' });
      } else {
        setShowCustomCity(false);
        setFormData({ ...formData, city: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCustomUniversityChange = (e) => {
    const value = e.target.value;
    setCustomUniversity(value);
    setFormData({ ...formData, university: value });
  };

  const handleCustomCityChange = (e) => {
    const value = e.target.value;
    setCustomCity(value);
    setFormData({ ...formData, city: value });
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Use flex column reverse on mobile, grid on desktop */}
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Sidebar – appears below main on mobile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-1">{user.fullName || "Student Name"}</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mb-6">{user.department || "Field of Study"}</p>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
            <button 
              onClick={() => navigate("/my-announcements")}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400"
            >
              My Applications
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const savedSection = document.getElementById("saved-internships");
                if (savedSection) savedSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400"
            >
              Saved Internships
              <Bookmark className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 transition-all text-red-500"
            >
              Sign Out
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-10 sm:space-y-12">
          {isEditing ? (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm"
            >
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Profile Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* University with "Other" */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">University</label>
                  <select
                    name="university"
                    value={showCustomUniversity ? 'other' : formData.university}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  >
                    <option value="">Select your university</option>
                    {ethiopianUniversities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                    <option value="other">Other (type your university)</option>
                  </select>
                  {showCustomUniversity && (
                    <input
                      type="text"
                      placeholder="Enter your university name"
                      value={customUniversity}
                      onChange={handleCustomUniversityChange}
                      className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                    />
                  )}
                </div>

                {/* Department with datalist */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Department</label>
                  <input
                    list="dept-list"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  />
                  <datalist id="dept-list">
                    {departmentSuggestions.map(dept => <option key={dept} value={dept} />)}
                  </datalist>
                </div>

                {/* City with "Other" */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    name="city"
                    value={showCustomCity ? 'other' : formData.city}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  >
                    <option value="">Select your city</option>
                    {ethiopianCities.map(city => <option key={city} value={city}>{city}</option>)}
                    <option value="other">Other (type your city)</option>
                  </select>
                  {showCustomCity && (
                    <input
                      type="text"
                      placeholder="Enter your city name"
                      value={customCity}
                      onChange={handleCustomCityChange}
                      className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                    />
                  )}
                </div>

                {/* Year of Study */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Year of Study</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Career Goal */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Career Goal</label>
                  <input
                    type="text"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    placeholder="e.g. Become a software engineer"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  />
                </div>

                {/* Location (optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Location (optional)</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Addis Ababa"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base"
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.section>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {/* Stats Cards – full width on mobile */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { label: "University", value: user.university || "Not set", icon: GraduationCap },
                  { label: "Department", value: user.department || "Not set", icon: Target },
                  { label: "City", value: user.city || user.location || "Not set", icon: MapPin }
                ].map((item, i) => (
                  <div key={i} className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{item.label}</p>
                    <p className="font-bold text-zinc-900 dark:text-white break-words">{item.value}</p>
                  </div>
                ))}
              </section>

              <section id="saved-internships">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Bookmark className="w-6 h-6 text-indigo-600" />
                    Saved Internships
                  </h3>
                  <span className="text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full w-fit">
                    {savedInternships.length} Items
                  </span>
                </div>
                
                {loadingSaved ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : savedInternships.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {savedInternships.map((internship) => (
                      <InternshipCard key={internship._id} internship={internship} />
                    ))}
                  </div>
                ) : (
                  <div className="p-10 sm:p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <Bookmark className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">You haven't saved any internships yet.</p>
                    <Link to="/internships" className="text-indigo-600 font-bold mt-2 inline-block hover:underline">
                      Browse opportunities
                    </Link>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;