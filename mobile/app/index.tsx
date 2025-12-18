import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";

export default function Index() {
  const services = [
    {
      name: "Backend API",
      url: "http://localhost:18000",
      description: "FastAPI backend with Uvicorn",
    },
    {
      name: "API Documentation",
      url: "http://localhost:18000/docs",
      description: "Scalar API documentation",
    },
    {
      name: "Health Check",
      url: "http://localhost:18000/health",
      description: "Backend health status endpoint",
    },
    {
      name: "Supabase Studio",
      url: "http://127.0.0.1:58423",
      description: "Database management interface",
    },
    {
      name: "Supabase API",
      url: "http://127.0.0.1:58421",
      description: "Supabase REST API",
    },
    {
      name: "Email Testing",
      url: "http://127.0.0.1:58424",
      description: "View test emails sent locally",
    },
  ];

  const technologies = [
    { category: "Frontend", items: ["Next.js 16", "React 19", "Tailwind CSS"] },
    { category: "Backend", items: ["FastAPI", "Uvicorn", "Python 3.11+"] },
    { category: "Database", items: ["Supabase", "PostgreSQL", "RLS"] },
    { category: "AI/ML", items: ["LangChain", "LangGraph", "Google GenAI"] },
    { category: "Mobile", items: ["Expo", "React Native", "NativeWind"] },
    { category: "Infrastructure", items: ["Railway", "Upstash Redis"] },
  ];

  const handlePress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">
            Startup Template 2026
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Production-ready full-stack template with modern technologies
          </Text>
        </View>

        {/* Technologies Section */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Technology Stack
          </Text>
          {technologies.map((tech, techIndex) => (
            <View
              key={tech.category}
              className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 ${
                techIndex < technologies.length - 1 ? "mb-4" : ""
              }`}
            >
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                {tech.category}
              </Text>
              <View className="flex-row flex-wrap">
                {tech.items.map((item) => (
                  <View
                    key={item}
                    className="bg-gray-100 rounded px-2 py-1 mr-2 mb-2"
                  >
                    <Text className="text-sm text-gray-700">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Services Section */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Development Services
          </Text>
          {services.map((service, serviceIndex) => (
            <TouchableOpacity
              key={service.name}
              onPress={() => handlePress(service.url)}
              className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 active:bg-gray-50 ${
                serviceIndex < services.length - 1 ? "mb-3" : ""
              }`}
            >
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                {service.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                {service.description}
              </Text>
              <Text className="text-xs text-blue-600 font-mono">
                {service.url}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Note */}
        <View className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-500 text-center">
            This is a foundational template. Start building by customizing the
            codebase in each service directory.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
