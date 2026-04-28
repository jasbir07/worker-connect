import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import "../styles/Profile.css";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    experience: "",
    location: "",
    phone: ""
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
      setFormData({
        bio: res.data.bio || "",
        skills: res.data.skills || [],
        experience: res.data.experience || "",
        location: res.data.location || "",
        phone: res.data.phone || ""
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const updateData =
        user.role === "worker"
          ? {
              bio: formData.bio,
              skills: formData.skills,
              experience: formData.experience,
              location: formData.location
            }
          : {
              phone: formData.phone,
              location: formData.location
            };

      const res = await API.put("/profile", updateData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    setError("");

    try {
      const res = await API.put("/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-container">Failed to load profile</div>;
  }

  const imageUrl = profile.profileImage
  ? `/api${profile.profileImage}`
  : null;
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-title">My Profile</h2>
          {!editing && (
            <button
              className="profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="profile-error">{error}</div>}

        {/* Profile Image */}
        <div className="profile-image-section">
          <div className="profile-image-wrapper">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <label className="profile-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
            {uploading ? "Uploading..." : "Change Photo"}
          </label>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Name - Readonly */}
            <div className="profile-field">
              <label className="profile-label">Name</label>
              <input
                type="text"
                value={profile.name || ""}
                disabled
                className="profile-input profile-input-disabled"
              />
            </div>

            {/* Email - Readonly */}
            <div className="profile-field">
              <label className="profile-label">Email</label>
              <input
                type="email"
                value={profile.email || ""}
                disabled
                className="profile-input profile-input-disabled"
              />
            </div>

            {/* Worker Fields */}
            {user.role === "worker" && (
              <>
                <div className="profile-field">
                  <label className="profile-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="profile-textarea"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Skills</label>
                  <div className="profile-skills-input">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                      className="profile-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="profile-add-skill-btn"
                    >
                      Add
                    </button>
                  </div>
                  <div className="profile-skills-list">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="profile-skill-tag">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="profile-skill-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Experience</label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Describe your experience..."
                    rows="3"
                    className="profile-textarea"
                  />
                </div>
              </>
            )}

            {/* Client Fields */}
            {user.role === "client" && (
              <div className="profile-field">
                <label className="profile-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="profile-input"
                />
              </div>
            )}

            {/* Location - Common Field */}
            <div className="profile-field">
              <label className="profile-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your location"
                className="profile-input"
              />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  loadProfile(); // Reset form
                }}
                className="profile-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            {/* Name */}
            <div className="profile-info-row">
              <span className="profile-info-label">Name:</span>
              <span className="profile-info-value">{profile.name || "N/A"}</span>
            </div>

            {/* Email */}
            <div className="profile-info-row">
              <span className="profile-info-label">Email:</span>
              <span className="profile-info-value">
                {profile.email || "N/A"}
              </span>
            </div>

            {/* Worker Specific Fields */}
            {user.role === "worker" && (
              <>
                {profile.bio && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Bio:</span>
                    <span className="profile-info-value">{profile.bio}</span>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Skills:</span>
                    <div className="profile-skills-display">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="profile-skill-tag-display">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.experience && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Experience:</span>
                    <span className="profile-info-value">
                      {profile.experience}
                    </span>
                  </div>
                )}

                {/* Rating */}
                <div className="profile-info-row">
                  <span className="profile-info-label">Rating:</span>
                  <span className="profile-info-value profile-rating">
                    ⭐ {profile.averageRating?.toFixed(1) || "0.0"}{" "}
                    {profile.totalRatings > 0 && (
                      <span className="profile-rating-count">
                        ({profile.totalRatings} review
                        {profile.totalRatings !== 1 ? "s" : ""})
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}

            {/* Client Specific Fields */}
            {user.role === "client" && (
              <>
                {profile.phone && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Phone:</span>
                    <span className="profile-info-value">{profile.phone}</span>
                  </div>
                )}

                <div className="profile-info-row">
                  <span className="profile-info-label">Total Jobs Posted:</span>
                  <span className="profile-info-value">
                    {profile.totalJobsPosted || 0}
                  </span>
                </div>
              </>
            )}

            {/* Location - Common Field */}
            {profile.location && (
              <div className="profile-info-row">
                <span className="profile-info-label">Location:</span>
                <span className="profile-info-value">{profile.location}</span>
              </div>
            )}

            {/* Member Since */}
            {profile.memberSince && (
              <div className="profile-info-row">
                <span className="profile-info-label">Member Since:</span>
                <span className="profile-info-value">
                  {formatDate(profile.memberSince)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

