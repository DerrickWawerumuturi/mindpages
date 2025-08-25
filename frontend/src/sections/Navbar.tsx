
import { useEffect, useRef, useState } from "react"
import { AiFillFolder } from "react-icons/ai"
import gsap from "gsap"


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(
                menuRef.current,
                { x: '-100%' },
                { x: 0, duration: 1, ease: 'power3.inOut' }
            )
        } else {
            gsap.to(
                menuRef.current,
                {
                    x: "-100%",
                    duration: 0.5,
                    ease: "power3.in"
                }
            )
        }
    }, [isOpen])

    return (

        <div className="navbar">
            <div>
                <a href="/" className="logo_name">Mind Pages</a>
            </div>
            <div className="logo_options">
                <AiFillFolder
                    size={25}
                    className="options_icon"
                    onClick={() => setIsOpen(!isOpen)}
                />

                {isOpen && (
                    <div
                        className="options_menu"
                        ref={menuRef}
                    >
                        <div className="options_menu_item">
                            <h1>Home</h1>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar