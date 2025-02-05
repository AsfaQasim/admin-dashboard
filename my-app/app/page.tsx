import { redirect } from "next/navigation";


const page = () => {
  redirect("/admin")
  return (
    <div>page</div>
  )
}

export default page