import "./App.css"
import ReactMapGL, { Marker, Popup } from "react-map-gl"
import { useEffect, useState } from "react"
import { Room, Star } from "@material-ui/icons"
import axios from "axios"
import { format } from "timeago.js"
import Register from "./components/Register"
import Login from "./components/Login"

//import "mapbox-gl/dist/mapbox-gl.css"
//import mapboxgl from "mapbox-gl"
//eslint-disable-next-line import/no-webpack-loader-syntax
//mapboxgl.workerClass =
//require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default

function App() {
  const myStorage = window.localStorage
  const [currentUser, setCurrentUser] = useState(null)
  const [viewport, setViewport] = useState({
    width: "100wh",
    height: "100vh",
    latitude: 46,
    longitude: 17,
    zoom: 4,
  })

  const [pins, setPins] = useState([])
  const [currentPlaceId, setCurrentPlaceId] = useState(
    myStorage.getItem("user")
  )
  const [newPlace, setNewPlace] = useState(null)
  const [title, setTitle] = useState(null)
  const [desc, setDesc] = useState(null)
  const [star, setStar] = useState(0)
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/api/pins"
        )
        setPins(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    getPins()
  }, [])

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id)
    setViewport({
      ...viewport,
      latitude: lat,
      longitude: long,
    })
  }

  const handleAddClick = (e) => {
    const [long, lat] = e.lngLat
    setNewPlace({
      lat,
      long,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    }
    try {
      const res = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/api/pins",
        newPin
      )
      setPins([...pins, res.data])
      setNewPlace(null)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    myStorage.removeItem("user")
    setCurrentUser(null)
  }

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        mapStyle="mapbox://styles/lakthana/ckwydksyr06zs14pf2lwkjwex"
        onClick={handleAddClick}
        transitionDuration="200"
      >
        {pins.map((p) => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-3.5 * viewport.zoom}
              offsetTop={-7 * viewport.zoom}
            >
              <Room
                style={{
                  fontSize: viewport.zoom * 7,
                  color: p.username === currentUser ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className="cart">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="star">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setNewPlace(null)}
          >
            <div>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  placeholder="Enter a title"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Review</label>
                <textarea
                  placeholder="say us somthing about this plase"
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setStar(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button className="submitButton" type="submit">
                  Add pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>
            {" "}
            Logout
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Login
            </button>

            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}

        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            myStorage={myStorage}
            setCurrentUser={setCurrentUser}
          />
        )}
      </ReactMapGL>
    </div>
  )
}

export default App
