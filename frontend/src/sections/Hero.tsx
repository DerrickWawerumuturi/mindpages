import React from "react"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const navigate = useNavigate()

    // intro animation
    useEffect(() => {
        gsap.fromTo(
            heroRef.current,
            { opacity: 0, y: 100 },
            {
                opacity: 1,
                y: 0,
                duration: 3,
                ease: "power2.out",
            }
        )
    }, [])

    // scaling and fading animation
    useEffect(() => {
        if (!titleRef.current || !heroRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "+=300%",
                scrub: true,
                pin: true,
                pinSpacing: false,
            }
        })

        // Scale the title from its position and fade it out as it gets bigger
        tl.fromTo(titleRef.current,
            {
                scale: 1,
                opacity: 1
            },
            {
                scale: 15,
                opacity: 0,
                ease: "power1.out",
            }
        )
    }, [])


    return (
        <div className="hero" ref={heroRef}>
            <h2 className="hero_title opacity-0" ref={titleRef}>Ask. Learn. Remember.</h2>
            <p className="hero_description">Turn your notes into instant answers with a smart assistant that understands your documents.</p>
            <div className="hero_button_container">
                <Button
                    variant={"black"}
                    className="rounded-lg hover:cursor-pointer"
                    onClick={() => navigate("/rag")}
                >
                    Try it out
                </Button>
                <Button variant={'outline'} className="rounded-lg hover:cursor-pointer text-red-300">View github</Button>
            </div>


        </div>
    )
}

export default Hero