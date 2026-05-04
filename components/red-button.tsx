import { Pressable, Text } from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import { fetchFromBackend } from "../scripts/authFetch"

interface RedButtonProps {
    text: string,
    onPressFunction ?: () => void
    disabled ?: boolean
}

const RedButtonProps = {
    text: "",
    onPressFunction: () => {},
    disabled: false
}

const RedButton = ({ text, onPressFunction, disabled }: RedButtonProps) => {
    const router = useRouter()

    const handlePress = () => {
        if (onPressFunction) {
            onPressFunction()
        } 
    }

    return (
        <Pressable onPress={handlePress} disabled={disabled} className="mb-4 mt-auto w-52 bg-umass-red rounded-xl p-3 items-center">
            <Text className="text-white font-bold">{text}</Text>
        </Pressable>
    )
}


export default RedButton