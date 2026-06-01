# User Preferences and AI Content Filtering Implementation

## Overview

This implementation adds comprehensive user preferences management and enhanced AI content filtering to the LW-Connect platform. Users can now customize their AI experience and the system provides robust protection against malicious content.

## Features Implemented

### 1. User Preferences System

#### Database Schema
- **UserPreferences Table**: Stores user-specific AI and learning preferences
- **AITopicSuggestion Table**: Contains AI-generated topic suggestions for users to choose from

#### Preference Categories
- **Learning Preferences**: Learning style, session duration, communication style, difficulty level
- **Content Preferences**: Preferred topics, blocked topics, content difficulty
- **Recommendation Preferences**: Frequency, max recommendations, AI suggestions toggle
- **Content Filtering**: Filter level, profanity filter, topic restrictions
- **AI Behavior**: Personality type, response length, follow-up questions

### 2. Enhanced AI Recommendations

#### Personalized Mentor Matching
- Uses user preferences to filter and score mentors
- Respects blocked topics and preferred topics
- Adjusts recommendation count based on user settings
- Considers preferred time slots and communication styles

#### Preference-Based Content Filtering
- Filters out blocked topics from search results
- Prioritizes preferred topics in recommendations
- Adjusts content difficulty based on user level

### 3. Advanced Content Filtering

#### Multi-Layer Protection
1. **Pattern-Based Filtering**: Regex patterns for immediate blocking of harmful content
2. **AI-Based Moderation**: LLM-powered content analysis
3. **User Preference Filtering**: Respects individual content preferences

#### Blocked Content Categories
- Malicious content (hacking, exploits, illegal activities)
- Inappropriate content (violence, discrimination, harassment)
- Off-topic requests unrelated to learning/mentorship
- System manipulation attempts

### 4. API Endpoints

#### User Preferences Management
- `GET /api/v1/preferences/` - Get user preferences
- `POST /api/v1/preferences/` - Create user preferences
- `PUT /api/v1/preferences/` - Update user preferences
- `GET /api/v1/preferences/options` - Get available preference options
- `GET /api/v1/preferences/topics/{category}` - Get topic suggestions by category

### 5. Frontend Interface

#### Preferences Management Page
- Intuitive interface for setting all preference categories
- Topic selection with suggested topics from AI
- Real-time preference updates
- Visual feedback for blocked/preferred topics

## Implementation Details

### Database Migration
```bash
# Run the migration to create preference tables
alembic upgrade head
```

### Seed Data
```bash
# Populate topic suggestions
python scripts/seed_topic_suggestions.py
```

### Configuration
The system uses existing configuration settings and adds new preference-based filtering to the AI pipeline.

## Security Features

### Content Filtering Patterns
- Blocks malicious keywords and phrases
- Prevents system manipulation attempts
- Filters inappropriate content based on severity levels

### User Privacy
- All preferences are user-specific and private
- No sharing of preference data between users
- Secure API endpoints with authentication

## Usage Examples

### Setting User Preferences
```python
# Create preferences for a user
preferences = {
    "preferred_learning_style": "visual",
    "content_difficulty_level": "intermediate",
    "preferred_topics": ["AI", "Leadership"],
    "blocked_topics": ["Politics"],
    "enable_profanity_filter": True,
    "ai_personality_type": "professional"
}
```

### AI Recommendation with Preferences
```python
# Get personalized mentor recommendations
recommendations = await ai_service.recommend_mentors(
    learner_interests=["AI", "Machine Learning"],
    user_id=user_id  # Automatically applies user preferences
)
```

### Content Filtering
```python
# Enhanced moderation check
moderation_result = await assistant._enhanced_moderate_query(
    query="User query here",
    user_id=user_id
)
```

## Benefits

### For Users
- Personalized AI experience tailored to learning preferences
- Protection from inappropriate or unwanted content
- Control over AI behavior and recommendation frequency
- Improved relevance of mentor and content suggestions

### For Platform
- Reduced risk of AI misuse
- Better user engagement through personalization
- Compliance with content safety standards
- Scalable preference management system

## Future Enhancements

### Planned Features
1. **Machine Learning Preference Optimization**: Learn from user interactions to auto-adjust preferences
2. **Advanced Topic Categorization**: AI-powered topic suggestion improvements
3. **Collaborative Filtering**: Suggest preferences based on similar users
4. **A/B Testing Framework**: Test different AI personalities and recommendation strategies

### Integration Points
- Integration with existing notification system for preference updates
- Connection to analytics for preference usage tracking
- API extensions for mobile app preference sync

## Maintenance

### Regular Tasks
1. **Topic Suggestion Updates**: Periodically refresh AI-generated topic suggestions
2. **Content Filter Updates**: Update blocked patterns based on new threats
3. **Preference Analytics**: Monitor preference usage to improve defaults
4. **Performance Monitoring**: Track impact of preferences on recommendation quality

### Monitoring
- Track preference adoption rates
- Monitor content filtering effectiveness
- Analyze AI recommendation performance with preferences enabled

## Troubleshooting

### Common Issues
1. **Preferences Not Saving**: Check authentication and API endpoint accessibility
2. **Content Still Blocked**: Verify content filter levels and blocked topic lists
3. **No Recommendations**: Check if user preferences are too restrictive

### Debug Commands
```bash
# Check user preferences
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/preferences/

# Test content filtering
curl -X POST -H "Content-Type: application/json" \
  -d '{"message": "test query", "user_id": "user_id"}' \
  http://localhost:8001/chat
```

This implementation ensures that the LW-Connect platform provides a safe, personalized, and effective AI-powered learning experience while maintaining the integrity of existing functionality.